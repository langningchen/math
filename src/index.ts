export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const { method } = request;
		if (method === 'GET') {
			const html = `
					<!DOCTYPE html>
					<html>
						<head>
							<link href="https://cdn.bootcdn.net/ajax/libs/twitter-bootstrap/5.3.1/css/bootstrap.min.css" rel="stylesheet">
							<script src="https://cdn.bootcdn.net/ajax/libs/twitter-bootstrap/5.3.1/js/bootstrap.min.js"></script>
							<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.2/es5/startup.min.js" async></script>
						</head>
						<body>
							<div class="container">
								<h1>Math calculator</h1>
								<div class="input-group mb-3">
									<input type="text" id="LatexInput" class="form-control" placeholder="Enter latex expression" required>
									<button type="submit" id="SubmitButton" class="btn btn-primary">Submit</button>
								</div>
								<div id="PreviewContainer"></div>
								<div class="result-container">
									<span>Result: </span><span id="Result"></span>
								</div>
							</div>
							<script>
								const SubmitButton = document.getElementById('SubmitButton');
								const LatexInput = document.getElementById('LatexInput');
								const Result = document.getElementById('Result');

								SubmitButton.addEventListener('click', async () => {
									const latexExpression = LatexInput.value;
									const response = await fetch(window.location.href, {
										method: 'POST',
										headers: {
											'Content-Type': 'application/json',
											'Accept': 'application/json',
											'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
											'Sec-Fetch-Dest': 'empty',
											'Sec-Fetch-Mode': 'cors',
											'Sec-Fetch-Site': 'same-origin',
											'X-Edge-Shopping-Flag': '1',
										},
										body: JSON.stringify({ latexExpression }),
									});
									const result = await response.json();
									Result.innerText = result.result;
								});

								MathJax = {
									loader: {
									  load: [
										'input/tex-base', // 必备基础库
										'output/chtml', // 必备基础库，用来将tex转换成html
									  ],
									},
								  };

								LatexInput.addEventListener('input', () => {
									const latexExpression = LatexInput.value;
									const previewContainer = document.getElementById('PreviewContainer');
									previewContainer.innerHTML = '';
									MathJax.tex2chtmlPromise(latexExpression)
										.then((node) => {
											previewContainer.appendChild(node);
											MathJax.startup.document.clear();
											MathJax.startup.document.updateDocument();
										})
										.catch((error) => {
											console.error(error);
										});
								});
							</script>
						</body>
					</html>
				`;
			return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html' } });
		} else if (method === 'POST') {
			const { latexExpression } = await request.json();

			if (!latexExpression) {
				return new Response('Please provide a latex expression', { status: 400 });
			}

			const mathSolverUrl = 'https://mathsolver.microsoft.com/cameraexp/api/v1/solvesimplelatex';
			const requestBody = {
				LatexExpression: latexExpression,
				clientInfo: { platform: 'web' },
			};

			const response = await fetch(mathSolverUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
					'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
					'Sec-Fetch-Dest': 'empty',
					'Sec-Fetch-Mode': 'cors',
					'Sec-Fetch-Site': 'same-origin',
					'X-Edge-Shopping-Flag': '1',
				},
				body: JSON.stringify(requestBody),
			});

			if (response.ok) {
				const result = await response.json();
				const { solution, isError, errorMessage } = result;
				if (isError) {
					return new Response(errorMessage, { status: 500 });
				}
				return new Response(JSON.stringify({ result: solution }), { status: 200, headers: { 'Content-Type': 'application/json' } });
			} else {
				return new Response('Failed to solve the math problem', { status: 500 });
			}
		}

		return new Response('Method not allowed', { status: 405 });
	},
};
