import React from "react"
import {Box, Typography, Paper, TextField, Button} from "@mui/material"

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
	return (
		<Box sx={{maxWidth: 700, mx: "auto", mt: 4, p: 2}}>
			<Typography variant="h4" gutterBottom>
				Define Screening Rules
			</Typography>
			<Paper sx={{p: 2, mb: 2}}>
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
