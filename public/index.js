const LanguageSelect = document.getElementById("LanguageSelect");
const LatexInput = document.getElementById("LatexInput");
const SubmitButton = document.getElementById("SubmitButton");
const SimpleResult = document.getElementById("SimpleResult");
const FullResult = document.getElementById("FullResult");

const SetLanguage = (Language) => {
    LanguageSelect.value = Language;
    localStorage.setItem("Language", Language);
}
const AddLoadingSpinner = (Element) => {
    const LoadingSpinner = document.createElement("div");
    LoadingSpinner.className = "spinner-border spinner-border-sm";
    LoadingSpinner.setAttribute("role", "status");
    LoadingSpinner.setAttribute("aria-hidden", "true");
    Element.appendChild(LoadingSpinner);
}
const RemoveLoadingSpinner = (Element) => {
    if (Element.lastChild.className === "spinner-border spinner-border-sm") {
        Element.removeChild(Element.lastChild);
    }
}
const RequestAPI = async (Endpoint, Data) => {
    const Result = await fetch("/" + Endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", },
        body: JSON.stringify(Data),
    });
    const JSONResult = await Result.json();
    if (!JSONResult.Success) { throw new Error(JSONResult.Error); }
    return JSONResult.Data;
};
const createAccordionItem = (name, content, isCollapsed = false) => {
    const UTF8ToBase64 = (UTF8String) => { return btoa(unescape(encodeURIComponent(UTF8String))); }
    return `
        <div class="accordion-item">
            <h2 class="accordion-header">
                <button class="accordion-button ${isCollapsed ? "collapsed" : ""}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${UTF8ToBase64(name)}">
                    ${name}
                </button>
            </h2>
            <div id="collapse${UTF8ToBase64(name)}" class="accordion-collapse collapse ${isCollapsed ? "" : "show"}">
                <div class="accordion-body">
                    ${content}
                </div>
            </div>
        </div>
    `;
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

LanguageSelect.addEventListener("change", () => { SetLanguage(LanguageSelect.value); });
LatexInput.addEventListener("input", () => {
    SubmitButton.disabled = LatexInput.value == "";
    if (LatexInput.value != "") {
        SimpleResult.innerHTML = FullResult.innerHTML = "";
        AddLoadingSpinner(SimpleResult);
        RequestAPI("SolveSimpleLatex", {
            LatexExpression: LatexInput.value,
            Language: LanguageSelect.value
        }).then(Result => {
            SimpleResult.innerHTML = "$$" + Result + "$$";
            MathJax.typesetPromise();
        }).catch(error => {
            SimpleResult.innerHTML = error;
        }).finally(() => {
            RemoveLoadingSpinner(SimpleResult);
        });
    }
});
SubmitButton.addEventListener("click", () => {
    SimpleResult.innerHTML = FullResult.innerHTML = "";
    AddLoadingSpinner(FullResult);
    RequestAPI("SolveLatex", {
        LatexExpression: LatexInput.value,
        Language: LanguageSelect.value
    }).then(Result => {
        FullResult.innerHTML = Result.map(Item =>
            createAccordionItem(Item.Name, `<p class="mb-2">${Item.Answer}</p>` +
                Item.TemplateSteps.map(templateStep =>
                    createAccordionItem(templateStep.Name, templateStep.Steps.map((step) =>
                        `
                                <div class="card mb-2">
                                    <div class="card-body">
                                        <h5 class="card-title">${step.Hint}</h5>
                                        <div>${step.Expression}</div>
                                    </div>
                                    <div class="card-footer">
                                        ${step.Step}
                                    </div>
                                </div>
                            `
                    ).join(""), true)
                ).join("")
            )
        ).join("");
        MathJax.typesetPromise();
    }).catch(error => {
        FullResult.innerHTML = error;
    }).finally(() => {
        RemoveLoadingSpinner(FullResult);
    });
});

document.body.dataset.bsTheme = ((window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light");
SetLanguage(localStorage.getItem("Language") || navigator.language.split("-")[0] || "en");
