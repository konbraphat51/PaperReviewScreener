import React, {useState, useRef} from "react"
import {BibTeXReader} from "./modules/BibTeXReader"
import {Article} from "./modules/Article"
import type {ScreenResult} from "./modules/Article"
import {JSONHandler} from "./modules/JSONHandler"
import type {ScreeningData, TagNode} from "./modules/JSONHandler"
import {defaultScreeningRules} from "./modules/ScreeningRules"
import "./App.css"
import {DefineRulesPhase} from "./components/DefineRulesPhase"
import {ScreeningPhase} from "./components/ScreeningPhase"

const defaultTags: TagNode[] = []

function App() {
	const [phase, setPhase] = useState<"defineRules" | "screening">("defineRules")
	const [rules, setRules] = useState<string[]>([...defaultScreeningRules])
	const [bibtexInput, setBibtexInput] = useState("")
	const [article, setArticle] = useState<Article | null>(null)
	const [screenResults, setScreenResults] = useState<ScreenResult[]>(
		rules.map((rule) => ({rule, passed: false})),
	)
	const [tags, setTags] = useState<string[]>([])
	const [screeningData, setScreeningData] = useState<ScreeningData>({
		articles: [],
		screens: rules,
		tags: defaultTags,
	})
	const fileInputRef = useRef<HTMLInputElement>(null)

	const handleBibtexSubmit = () => {
		try {
			BibTeXReader.parse(bibtexInput)
			setArticle(new Article(bibtexInput))
			setScreenResults(
				defaultScreeningRules.map((rule) => ({rule, passed: false})),
			)
			setTags([])
		} catch (e) {
			alert("Invalid BibTeX")
		}
	}

	const handleScreenChange = (idx: number, checked: boolean) => {
		setScreenResults((results) =>
			results.map((r, i) => (i === idx ? {...r, passed: checked} : r)),
		)
	}

	const handleTagAdd = (tag: string) => {
		if (!tags.includes(tag)) setTags([...tags, tag])
	}

	const handleTagRemove = (tag: string) => {
		setTags(tags.filter((t) => t !== tag))
	}

	const handleScreeningDone = () => {
		if (!article) return
		const newArticle = new Article(article.bibtex, screenResults, tags)
		setScreeningData((data) => ({
			...data,
			articles: [...data.articles, newArticle],
		}))
		setArticle(null)
		setBibtexInput("")
		setScreenResults(
			defaultScreeningRules.map((rule) => ({rule, passed: false})),
		)
		setTags([])
	}

	const handleExport = () => {
		const json = JSONHandler.export(screeningData)
		const blob = new Blob([json], {type: "application/json"})
		const url = URL.createObjectURL(blob)
		const a = document.createElement("a")
		a.href = url
		a.download = "screening_data.json"
		a.click()
		URL.revokeObjectURL(url)
	}

	const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return
		const reader = new FileReader()
		reader.onload = () => {
			try {
				const data = JSONHandler.import(reader.result as string)
				setScreeningData(data)
			} catch {
				alert("Invalid JSON")
			}
		}
		reader.readAsText(file)
	}

	// --- Define Rules Phase UI ---
	if (phase === "defineRules") {
		return (
			<DefineRulesPhase
				rules={rules}
				setRules={setRules}
				onStart={() => {
					setScreenResults(rules.map((rule) => ({rule, passed: false})))
					setScreeningData((data) => ({...data, screens: rules}))
					setPhase("screening")
				}}
			/>
		)
	}

	// Only show screening UI if phase is 'screening'
	if (phase !== "screening") return null

	return (
		<ScreeningPhase
			article={article}
			bibtexInput={bibtexInput}
			screenResults={screenResults}
			tags={tags}
			screeningData={screeningData}
			fileInputRef={fileInputRef}
			onBibtexInput={setBibtexInput}
			onBibtexSubmit={handleBibtexSubmit}
			onScreenChange={handleScreenChange}
			onTagAdd={handleTagAdd}
			onTagRemove={handleTagRemove}
			onScreeningDone={handleScreeningDone}
			onExport={handleExport}
			onImport={handleImport}
		/>
	)
}

export default App
