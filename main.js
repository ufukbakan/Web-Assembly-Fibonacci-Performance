window.addEventListener("load", onloadFunc);

async function onloadFunc() {
    let x = 25;
    const fibonacciInput = document.getElementById("fibonacci-input");
    const calcButton = document.getElementById("calculate-button");
    const domContext = {
        jsResult: document.getElementById("js-result"),
        wasmResult: document.getElementById("wasm-result")
    }
    Object.freeze(domContext);

    fibonacciInput.addEventListener("change", e => (x = e.target.value));
    calcButton.addEventListener("click", calculate.bind(domContext));

    const importObject = {
        env: {
            __memory_base: 0,
            __table_base: 0,
            memory: new WebAssembly.Memory({ initial: 1, maximum: 10, shared: true }),
        }
    };

    await fetch('fibonacci.wasm').
        then(response => response.arrayBuffer()).
        then(bytes => WebAssembly.instantiate(bytes, importObject)).
        then(obj => window.wasmInstance = obj.instance);

    function calculate() {
        this.jsResult.innerText = measurePerformance(fib.bind(undefined,fibonacciInput.value));
        this.wasmResult.innerText = measurePerformance(wasmInstance.exports.fib.bind(undefined,fibonacciInput.value));
    }

    function measurePerformance(callback) {
        let startTime = performance.now();
        let result = callback();
        let endTime = performance.now();
        return `============================\nResult is: ${result}\n${getFunctionName(callback.name)} calculation time: ${endTime - startTime}`;
    }

    function getFunctionName(x){
        const name = x.replace("bound", "").replace("function", "").trim();
        if(name == "0"){
            return "WASM Function";
        }else{
            return "JS Function";
        }
    }

    function fib(x) {
        if (x <= 1) {
            return 1;
        } else {
            return fib(x - 1) + fib(x - 2);
        }
    }
}