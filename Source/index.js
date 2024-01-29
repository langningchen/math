const SubmitButton = document.getElementById("SubmitButton");
const LatexInput = document.getElementById("LatexInput");
const SimpleResult = document.getElementById("SimpleResult");

MathJax = {
    loader: {
        load: [
            "input/tex-base",
            "output/chtml",
        ],
    },
};

SubmitButton.addEventListener("click", () => {
    fetch("/SolveLatex", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ LatexExpression: LatexInput.value }),
    })
        .then((response) => response.json())
        .then((result) => {
            console.log(result);
        });
});
LatexInput.addEventListener("input", () => {
    fetch("/SolveSimpleLatex", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ LatexExpression: LatexInput.value }),
    })
        .then((response) => response.json())
        .then((result) => {
            SimpleResult.innerHTML = result.result;
        });
});

LatexInput.addEventListener("input", () => {
    const latexExpression = LatexInput.value;
    const previewContainer = document.getElementById("PreviewContainer");
    previewContainer.innerHTML = "";
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