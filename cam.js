document.addEventListener("DOMContentLoaded", async () => {
    const image = document.getElementById("image");
    const res = document.getElementById("result");
    const allergies = ["wheat", "barley", "rye", "gluten"]
    const worker = await Tesseract.createWorker();
    image.onchange = async () => {
        let found = [];
        console.log(image.files)
        console.log("change")
        document.querySelector("#picture").src = URL.createObjectURL(image.files[0])
        const result = await worker.recognize(document.querySelector("#picture").src);
        console.log("result", result)
        const imageWords = result.data.text.toLowerCase();
        console.log(imageWords.split(" "))

        allergies.forEach((allergy) => {
            imageWords.includes(allergy) ? found.push(allergy) : ""
        })

        console.log(found)

        res.value = found.length > 0 ? `Item has or may have ${found}.` : "No Allergies";
    }
})