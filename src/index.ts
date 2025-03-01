/**********************************************************************
Math: A math solver server using the API of [Microsoft Math Solver](https://math.microsoft.com/).
Copyright (C) 2024  langningchen

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
**********************************************************************/

const SolveSimple = async (Latex: string, Language: string) => {
	var Data = await fetch("https://mathsolver.microsoft.com/cameraexp/api/v1/solvesimplelatex", {
		method: "POST",
		headers: {
			"content-type": "application/json",
		},
		body: JSON.stringify({
			"latexExpression": Latex,
			"clientInfo": {
				"mkt": Language,
			}
		}),
	});
	Data = await Data.json();
	Data = Data["solution"];
	if (Data["isError"]) {
		throw Data["errorMessage"];
	}
	return Data;
}
const SolveMathProblem = async (Latex: string, Language: string) => {
	var Data = await fetch("https://mathsolver.microsoft.com/cameraexp/api/v1/solvelatex", {
		method: "POST",
		headers: { "content-type": "application/json", },
		body: JSON.stringify({
			"latexExpression": Latex,
			"clientInfo": { "mkt": Language, }
		}),
	});
	Data = await Data.json();
	Data = JSON.parse(Data["results"][0]["tags"][0]["actions"][0]["customData"]);
	Data = JSON.parse(Data["previewText"]);
	if (Data["errorMessage"] !== "") { throw new Error(Data["errorMessage"]); }
	Data = Data["mathSolverResult"];
	if (Data["errorMessage"] !== "") { throw new Error(Data["errorMessage"]); }
	Data = Data["actions"];
	if (!Array.isArray(Data)) { throw new Error("Expected an array of actions"); }
	var FullResult = new Array();
	for (const i of Data) {
		var Results = {
			Name: i["actionName"],
			Answer: i["solution"],
			TemplateSteps: new Array(),
		};
		var TemplateSteps = i["templateSteps"];
		for (const j of TemplateSteps) {
			var Steps = j["steps"];
			var Result = {
				Name: j["templateName"],
				Steps: new Array(),
			}
			for (const k of Steps) {
				Result.Steps.push({
					Hint: k["hint"],
					Step: k["step"],
					Expression: k["expression"],
				});
			}
			Results["TemplateSteps"].push(Result);
		}
		FullResult.push(Results);
	}
	return FullResult;
};

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const { method } = request;
		const path = new URL(request.url).pathname;
		if (method !== "POST") { return new Response("Method not allowed", { status: 405 }); }
		var Result = {
			Success: true,
			Error: "",
			Data: {},
		};
		try {
			const { LatexExpression, Language } = await request.json();
			if (!LatexExpression) {
				Result.Success = false;
				Result.Error = "Please provide a latex expression";
			}
			if (path === "/SolveLatex") {
				Result.Data = await SolveMathProblem(LatexExpression, Language || "en");
			}
			else if (path === "/SolveSimpleLatex") {
				Result.Data = await SolveSimple(LatexExpression, Language || "en");
			}
			else {
				Result.Success = false;
				Result.Error = "Not found";
			}
			console.log(Result);
		}
		catch (ErrorDetail) {
			Result.Success = false;
			Result.Error = (ErrorDetail as Error).message;
		}
		return new Response(JSON.stringify(Result), { headers: { "Content-Type": "application/json" } });
	},
};
