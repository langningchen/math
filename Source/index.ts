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

import html from "./index.html";
import js from "./index.js";

const SolveSimple = async (Latex: string) => {
	var Data = await fetch("https://mathsolver.microsoft.com/cameraexp/api/v1/solvesimplelatex", {
		method: "POST",
		headers: {
			"content-type": "application/json",
		},
		body: JSON.stringify({
			"latexExpression": Latex,
		}),
	});
	Data = await Data.json();
	Data = Data["solution"];
	if (Data["isError"]) {
		throw Data["errorMessage"];
	}
	return Data;
}
const SolveMathProblem = async (Latex: string) => {
	var Data = await fetch("https://mathsolver.microsoft.com/cameraexp/api/v1/solvelatex", {
		method: "POST",
		headers: {
			"content-type": "application/json",
		},
		body: JSON.stringify({
			"latexExpression": Latex,
		}),
	});
	Data = await Data.json();
	Data = JSON.parse(Data["results"][0]["tags"][0]["actions"][0]["customData"]);
	Data = JSON.parse(Data["previewText"]);
	Data = Data["mathSolverResult"]
	if (Data["errorMessage"] !== "") {
		throw Data["errorMessage"];
	}
	Data = Data["actions"];
	var FullResult = [];
	for (var i = 0; i < Data.length; i++) {
		var Temp = {};
		Temp["Name"] = Data[i]["actionName"];
		Temp["Answer"] = Data[i]["solution"];
		Temp["TemplateSteps"] = [];
		var TemplateSteps = Data[i]["templateSteps"];
		for (var j = 0; j < TemplateSteps.length; j++) {
			var Steps = TemplateSteps[j]["steps"];
			var Temp2 = {
				"Name": TemplateSteps[j]["templateName"],
				"Steps": [],
			}
			for (var k = 0; k < Steps.length; k++) {
				var Temp3 = {};
				Temp3["Hint"] = Steps[k]["hint"];
				Temp3["Step"] = Steps[k]["step"];
				Temp3["Expression"] = Steps[k]["expression"];
				Temp2.Steps.push(Temp3);
			}
			Temp["TemplateSteps"].push(Temp2);
		}
		FullResult.push(Temp);
	}
	return FullResult;
};

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const { method } = request;
		const path = new URL(request.url).pathname;
		if (method === "GET") {
			if (path === "/") {
				return new Response(html, { status: 200, headers: { "Content-Type": "text/html" } });
			}
			else if (path === "/index.js") {
				return new Response(js, { status: 200, headers: { "Content-Type": "application/javascript" } });
			}
			else if (path.startsWith("/mathlive/")) {
				const url = new URL(request.url);
				url.host = "unpkg.com";
				url.port = "80";
				console.log(url.toString());
				return fetch(url.toString());
			}
			else {
				return new Response("Not found", { status: 404 });
			}
		} else if (method === "POST") {
			var Result = {
				"Success": true,
				"Error": "",
				"Data": {},
			};
			try {
			const { LatexExpression } = await request.json();
			if (!LatexExpression) {
				Result.Success = false;
				Result.Error = "Please provide a latex expression";
			}
			if (path === "/SolveLatex") {
				Result.Data = await SolveMathProblem(LatexExpression);
			}
			else if (path === "/SolveSimpleLatex") {
				Result.Data = await SolveSimple(LatexExpression);
			}
			else {
				Result.Success = false;
				Result.Error = "Not found";
			}
			}
			catch (ErrorDetail) {
				Result.Success = false;
				Result.Error = ErrorDetail;
			}
			return new Response(JSON.stringify(Result), { status: 200, headers: { "Content-Type": "application/json" } });
		}
		return new Response("Method not allowed", { status: 405 });
	},
};
