const LatexInput = document.getElementById("LatexInput");
const SubmitButton = document.getElementById("SubmitButton");
const SimpleResult = document.getElementById("SimpleResult");
const FullResult = document.getElementById("FullResult");
const RequestAPI = async (Endpoint, Data) => {
    const Result = await fetch("/" + Endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(Data),
    });
    const JSONResult = await Result.json();
    if (!JSONResult.Success) {
        console.log(JSONResult.Error);
        alert(JSONResult.Error);
    }
    return JSONResult.Data;
};
const SolveSimpleLatex = (LatexExpression) => {
    RequestAPI("SolveSimpleLatex", { LatexExpression })
        .then(Result => {
            SimpleResult.innerHTML = "$$" + Result + "$$";
            MathJax.typesetPromise();
        });
};
const SolveLatex = (LatexExpression) => {
    RequestAPI("SolveLatex", { LatexExpression })
        .then(Result => {
            FullResult.innerHTML = "";
            Result.forEach(Item => {
                const AccordionItem = document.createElement("div");
                AccordionItem.className = "accordion-item";
                const AccordionHeader = document.createElement("h2");
                AccordionHeader.className = "accordion-header";
                const AccordionButton = document.createElement("button");
                AccordionButton.className = "accordion-button";
                AccordionButton.type = "button";
                AccordionButton.setAttribute("data-bs-toggle", "collapse");
                AccordionButton.setAttribute("data-bs-target", `#collapse${Item.Name}`);
                AccordionButton.setAttribute("aria-expanded", "true");
                AccordionButton.setAttribute("aria-controls", `collapse${Item.Name}`);
                AccordionButton.innerHTML = Item.Name;
                const AccordionCollapse = document.createElement("div");
                AccordionCollapse.id = `collapse${Item.Name}`;
                AccordionCollapse.className = "accordion-collapse collapse show";
                AccordionCollapse.setAttribute("aria-labelledby", `heading${Item.Name}`);
                const AccordionBody = document.createElement("div");
                AccordionBody.className = "accordion-body";
                const AccordionBodyContent = document.createElement("div");
                AccordionBodyContent.className = "accordion-body-content";
                AccordionBodyContent.innerHTML = Item.Answer;
                Item.Steps.forEach(Step => {
                    const Card = document.createElement("div");
                    Card.className = "card";
                    const CardBody = document.createElement("div");
                    CardBody.className = "card-body";
                    const CardTitle = document.createElement("h5");
                    CardTitle.className = "card-title";
                    CardTitle.innerHTML = Step.Hint;
                    const CardText = document.createElement("p");
                    CardText.className = "card-text";
                    CardText.innerHTML = Step.PreviousExpression;
                    const CardFooter = document.createElement("div");
                    CardFooter.className = "card-footer";
                    const CardFooterText = document.createElement("small");
                    CardFooterText.className = "text-muted";
                    CardFooterText.innerHTML = Step.Step;
                    CardBody.appendChild(CardTitle);
                    CardBody.appendChild(CardText);
                    CardFooter.appendChild(CardFooterText);
                    Card.appendChild(CardBody);
                    Card.appendChild(CardFooter);
                    AccordionBodyContent.appendChild(Card);
                });
                AccordionBody.appendChild(AccordionBodyContent);
                AccordionCollapse.appendChild(AccordionBody);
                AccordionHeader.appendChild(AccordionButton);
                AccordionItem.appendChild(AccordionHeader);
                AccordionItem.appendChild(AccordionCollapse);
                FullResult.appendChild(AccordionItem);
            });
            MathJax.typesetPromise();
        });
};

MathJax = {
    loader: {
        load: [
            "input/tex-base",
            "output/chtml",
        ],
    },
    tex: {
        inlineMath: [
            ["$", "$"],
        ],
        displayMath: [
            ["$$", "$$"],
        ],
        processEscapes: true,
        processEnvironments: true,
        packages: { "[+]": ["noerrors"] },
    },
};

SubmitButton.addEventListener("click", () => {
    SolveSimpleLatex(LatexInput.value);
    SolveLatex(LatexInput.value);
});
LatexInput.addEventListener("input", () => {
    SimpleResult.innerHTML = "";
    FullResult.innerHTML = "";
    if (LatexInput.value != "") {
        SolveSimpleLatex(LatexInput.value);
        MathJax.typesetPromise();
    }
});