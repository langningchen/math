const SubmitButton = document.getElementById("SubmitButton");
const LatexInput = document.getElementById("LatexInput");
const SimpleResult = document.getElementById("SimpleResult");
const Result = document.getElementById("Result");

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
            /*
            {
    "result": [
        {
            "Name": "求值",
            "Answer": "$2$",
            "Steps": [
                {
                    "Hint": "将两项相加。",
                    "Step": "$1$ 与 $1$ 相加，得到 $2$。",
                    "Expression": "$$2$$ ",
                    "PreviousExpression": "$$1+1$$"
                }
            ]
        },
        {
            "Name": "因式分解",
            "Answer": "$2$",
            "Steps": []
        }
    ]
}
            */
            Result.innerHTML = "";
            // Accordion show big result, Name is the title
            result.result.forEach((item) => {
                const accordionItem = document.createElement("div");
                accordionItem.className = "accordion-item";
                const accordionHeader = document.createElement("h2");
                accordionHeader.className = "accordion-header";
                const accordionButton = document.createElement("button");
                accordionButton.className = "accordion-button";
                accordionButton.type = "button";
                accordionButton.setAttribute("data-bs-toggle", "collapse");
                accordionButton.setAttribute("data-bs-target", `#collapse${item.Name}`);
                accordionButton.setAttribute("aria-expanded", "true");
                accordionButton.setAttribute("aria-controls", `collapse${item.Name}`);
                accordionButton.innerHTML = item.Name;
                const accordionCollapse = document.createElement("div");
                accordionCollapse.id = `collapse${item.Name}`;
                accordionCollapse.className = "accordion-collapse collapse show";
                accordionCollapse.setAttribute("aria-labelledby", `heading${item.Name}`);
                const accordionBody = document.createElement("div");
                accordionBody.className = "accordion-body";
                const accordionBodyContent = document.createElement("div");
                accordionBodyContent.className = "accordion-body-content";
                accordionBodyContent.innerHTML = JSON.stringify(item, null, 4);
                accordionBody.appendChild(accordionBodyContent);
                accordionCollapse.appendChild(accordionBody);
                accordionHeader.appendChild(accordionButton);
                accordionItem.appendChild(accordionHeader);
                accordionItem.appendChild(accordionCollapse);
                Result.appendChild(accordionItem);
            });
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
            MathJax.tex2chtmlPromise(result.result)
                .then((node) => {
                    SimpleResult.innerHTML = "";
                    SimpleResult.appendChild(node);
                    MathJax.startup.document.clear();
                    MathJax.startup.document.updateDocument();
                })
                .catch((error) => {
                    console.error(error);
                });
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