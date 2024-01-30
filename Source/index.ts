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
		Temp["Steps"] = [];
		var Steps = Data[i]["templateSteps"];
		for (var j = 0; j < Steps.length; j++) {
			var Temp2 = {};
			Temp2["Hint"] = Steps[j]["steps"][0]["hint"];
			Temp2["Step"] = Steps[j]["steps"][0]["step"];
			Temp2["Expression"] = Steps[j]["steps"][0]["expression"];
			Temp2["PreviousExpression"] = Steps[j]["steps"][0]["prevExpression"];
			Temp["Steps"].push(Temp2);
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
