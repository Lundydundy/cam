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
        
        const result = await worker.recognize(image.files[0], {
            oem: 1
        });
        
        console.log("result", result)
        const imageWords = result.data.text.toLowerCase();
        console.log(imageWords)
        allergies.forEach((allergy) => {
            imageWords.includes(allergy) ? found.push(allergy) : ""
        })

        console.log(found)

        res.value = found.length > 0 ? `Item has or may have ${found}.` : "No Allergies";
    }
})

// document.addEventListener("DOMContentLoaded", async () => {
//     const image = document.getElementById("image");
//     const res = document.getElementById("result");
//     const allergies = ["wheat", "barley", "rye", "gluten"];
//     const worker = await Tesseract.createWorker();

//     image.onchange = async () => {
//         const file = image.files[0];
//         if (!file) return; // Ensure a file is selected

//         const found = await recognizeAndConvert(file, worker, allergies);
//         res.value = found.length > 0 ? `Item has or may have ${found}.` : "No Allergies";
//     };
// });

// async function recognizeAndConvert(file, worker, allergies) {
//     const image = new Image();
//     const canvas = document.createElement("canvas");
//     const ctx = canvas.getContext("2d");

//     return new Promise((resolve, reject) => {
//         image.onload = async () => {
//             canvas.width = image.width;
//             canvas.height = image.height;
//             ctx.drawImage(image, 0, 0);

//             // Convert canvas content to PNG image
//             const pngImageData = canvas.toDataURL("image/png");

//             // Perform text recognition on the original image
//             const result = await worker.recognize(pngImageData, { oem: 1 });
//             console.log("result", result)
//             const imageWords = result.data.text.toLowerCase();
//             const found = allergies.filter(allergy => imageWords.includes(allergy));
//             resolve(found);
//         };

//         image.src = URL.createObjectURL(file);
//         document.querySelector("#picture").src = image.src;
//     });
// }
