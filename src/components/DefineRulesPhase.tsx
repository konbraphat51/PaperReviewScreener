import React from "react"
import {
	Box,
	Typography,
	Paper,
	TextField,
	Button,
	Stack,
	IconButton,
} from "@mui/material"
import UploadFileIcon from "@mui/icons-material/UploadFile"

export type DefineRulesPhaseProps = {
	rules: string[]
	setRules: React.Dispatch<React.SetStateAction<string[]>>
	onStart: () => void
}

export function DefineRulesPhase({
	rules,
	setRules,
	onStart,
}: DefineRulesPhaseProps) {
	const fileInputRef = React.useRef<HTMLInputElement | null>(null)

	const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return
		const reader = new FileReader()
		reader.onload = (event) => {
			try {
				const json = JSON.parse(event.target?.result as string)
				if (Array.isArray(json.rules)) {
					setRules(json.rules)
					onStart() // Automatically move to screening phase
				}
			} catch {}
		}
		reader.readAsText(file)
	}

	return (
		<Box sx={{maxWidth: 700, mx: "auto", mt: 4, p: 2}}>
			<Typography variant="h4" gutterBottom>
				Define Screening Rules
			</Typography>
			<Paper sx={{p: 2, mb: 2}}>
				<Stack direction="row" spacing={2} mb={2}>
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
						onChange={handleImport}
					/>
				</Stack>
				{rules.map((rule, idx) => (
					<Box key={idx} sx={{display: "flex", alignItems: "center", mb: 1}}>
						<TextField
							fullWidth
							value={rule}
							onChange={(e) => {
								const newRules = [...rules]
								newRules[idx] = e.target.value
								setRules(newRules)
							}}
							sx={{mr: 1}}
						/>
						<Button
							color="error"
							onClick={() => {
								const newRules = rules.filter((_, i) => i !== idx)
								setRules(newRules)
							}}
						>
							Delete
						</Button>
					</Box>
				))}
				<Button onClick={() => setRules([...rules, ""])} sx={{mt: 1}}>
					Add Rule
				</Button>
			</Paper>
			<Button
				variant="contained"
				disabled={rules.length === 0 || rules.some((r) => !r.trim())}
				onClick={onStart}
			>
				Start Screening
			</Button>
		</Box>
	)
}
