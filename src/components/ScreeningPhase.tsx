import React from "react"
import {
	Box,
	Typography,
	Paper,
	TextField,
	Button,
	Stack,
	FormControlLabel,
	Checkbox,
	Chip,
} from "@mui/material"
import SaveIcon from "@mui/icons-material/Save"
import UploadFileIcon from "@mui/icons-material/UploadFile"
import {BibTeXReader} from "../modules/BibTeXReader"
import type {Article} from "../modules/Article"
import type {ScreenResult} from "../modules/Article"
import type {ScreeningData, TagNode} from "../modules/JSONHandler"

export type ScreeningPhaseProps = {
	article: Article | null
	bibtexInput: string
	screenResults: ScreenResult[]
	tags: string[]
	screeningData: ScreeningData
	fileInputRef: React.RefObject<HTMLInputElement | null>
	onBibtexInput: (v: string) => void
	onBibtexSubmit: () => void
	onScreenChange: (idx: number, checked: boolean) => void
	onTagAdd: (tag: string) => void
	onTagRemove: (tag: string) => void
	onScreeningDone: () => void
	onExport: () => void
	onImport: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function ScreeningPhase({
	article,
	bibtexInput,
	screenResults,
	tags,
	screeningData,
	fileInputRef,
	onBibtexInput,
	onBibtexSubmit,
	onScreenChange,
	onTagAdd,
	onTagRemove,
	onScreeningDone,
	onExport,
	onImport,
}: ScreeningPhaseProps) {
	const [newTag, setNewTag] = React.useState("")

	// Helper: Add tree-structured tag to tag tree
	function addTreeTagToTree(tree: TagNode[], path: string[]) {
		if (!path.length) return
		const [head, ...rest] = path
		let node = tree.find((n) => n.value === head)
		if (!node) {
			node = {label: head, value: head, children: []}
			tree.push(node)
		}
		if (rest.length > 0) {
			if (!node.children) node.children = []
			addTreeTagToTree(node.children, rest)
		}
	}

	// Helper: Get canonical tag value from path (always full path from root, e.g. 'A/B/C')
	function canonicalTagValueFromNode(node: TagNode, parentPath: string[] = []) {
		const path = [...parentPath, node.value]
		return path.join("/")
	}

	// Render tag tree with all nodes at the current level in a horizontal row, children below their parent row
	const renderTagTree = (nodes: TagNode[], parentPath: string[] = []) => {
		if (!nodes.length) return null
		return (
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "flex-start",
					marginBottom: 16,
				}}
			>
				{nodes.map((node) => {
					const canonical = [...parentPath, node.value].join("/")
					const hasChildren = !!node.children && node.children.length > 0
					return (
						<div
							key={canonical}
							style={{
								display: "flex",
								flexDirection: "row",
								alignItems: "center",
								marginRight: 24,
							}}
						>
							<Button
								size="small"
								variant="outlined"
								onClick={() => onTagAdd(canonical)}
								style={{
									minWidth: 80,
									fontFamily: "monospace",
									textTransform: "none",
									marginBottom: 4,
								}}
							>
								{node.label}
							</Button>
							{hasChildren && (
								<div style={{marginTop: 4}}>
									{renderTagTree(node.children!, [...parentPath, node.value])}
								</div>
							)}
						</div>
					)
				})}
			</div>
		)
	}

	const handleAddCustomTag = () => {
		const trimmed = newTag.trim()
		if (!trimmed) return
		const path = trimmed
			.split("/")
			.map((s) => s.trim())
			.filter(Boolean)
		if (!path.length) return
		const canonical = path.join("/")
		if (!tags.includes(canonical)) {
			onTagAdd(canonical)
		}
		// Add to tag tree if not present
		const tagsCopy = JSON.parse(JSON.stringify(screeningData.tags))
		addTreeTagToTree(tagsCopy, path)
		screeningData.tags.splice(0, screeningData.tags.length, ...tagsCopy)
		setNewTag("")
	}

	return (
		<Box sx={{maxWidth: 700, mx: "auto", mt: 4, p: 2}}>
			<Typography variant="h4" gutterBottom>
				Academic Paper Screening Tool
			</Typography>
			<Stack direction="row" spacing={2} mb={2}>
				<Button variant="contained" startIcon={<SaveIcon />} onClick={onExport}>
					Export JSON
				</Button>
				<Button
					variant="contained"
					startIcon={<UploadFileIcon />}
					onClick={() => fileInputRef.current?.click()}
				>
					Import JSON
				</Button>
				<input
					type="file"
					accept="application/json"
					ref={fileInputRef}
					style={{display: "none"}}
					onChange={onImport}
				/>
			</Stack>
			{!article && (
				<Paper sx={{p: 2, mb: 2}}>
					<Typography variant="h6">Paste BibTeX</Typography>
					<TextField
						fullWidth
						multiline
						minRows={4}
						value={bibtexInput}
						onChange={(e) => onBibtexInput(e.target.value)}
						placeholder="Paste BibTeX here..."
						sx={{mb: 2}}
					/>
					<Button variant="contained" onClick={onBibtexSubmit}>
						Load Article
					</Button>
				</Paper>
			)}
			{article && (
				<Paper sx={{p: 2, mb: 2}}>
					<Typography variant="h6">Screening Article</Typography>
					<Typography variant="subtitle1" sx={{mt: 1, mb: 1}}>
						<b>Title:</b> {BibTeXReader.parse(article.bibtex).title}
					</Typography>
					<Typography variant="body2" sx={{mb: 2}}>
						<b>Abstract:</b> {BibTeXReader.parse(article.bibtex).abstract}
					</Typography>
					<Typography variant="subtitle2">Screening Checklist</Typography>
					{screenResults.map((result, idx) => (
						<FormControlLabel
							key={result.rule}
							control={
								<Checkbox
									checked={result.passed}
									onChange={(e) => onScreenChange(idx, e.target.checked)}
								/>
							}
							label={result.rule}
						/>
					))}
					<Typography variant="subtitle2" sx={{mt: 2}}>
						Tags
					</Typography>
					<Box>{renderTagTree(screeningData.tags)}</Box>
					<Box sx={{display: "flex", alignItems: "center", mt: 1}}>
						<TextField
							label="Add tag (tree: A/B/C)"
							value={newTag}
							onChange={(e) => setNewTag(e.target.value)}
							size="small"
							sx={{mr: 1, width: 220}}
						/>
						<Button
							variant="outlined"
							onClick={handleAddCustomTag}
							disabled={!newTag.trim() || tags.includes(newTag.trim())}
						>
							Add
						</Button>
					</Box>
					<Box sx={{mt: 1}}>
						{tags.map((tag) => (
							<Chip
								key={tag}
								label={tag}
								onDelete={() => onTagRemove(tag)}
								sx={{mr: 1}}
							/>
						))}
					</Box>
					<Button variant="contained" sx={{mt: 2}} onClick={onScreeningDone}>
						Done & Next
					</Button>
				</Paper>
			)}
			<Paper sx={{p: 2}}>
				<Typography variant="h6">
					Screened Articles: {screeningData.articles.length}
				</Typography>
				<ul>
					{screeningData.articles.map((a, i) => (
						<li key={i}>
							{BibTeXReader.parse(a.bibtex).title || "Untitled"} (
							{a.tags.join(", ")})
						</li>
					))}
				</ul>
			</Paper>
		</Box>
	)
}
