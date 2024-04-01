document.addEventListener("DOMContentLoaded", async () => {
    const image = document.getElementById("image");
    const res = document.getElementById("result");
    const allergies = ["wheat", "barley", "rye", "gluten"]
    const worker = await Tesseract.createWorker();
    
    image.onchange = async () => {
        const trie = new Trie()
        document.querySelector(".loader").style.display = "block"
        
        const result = await worker.recognize(image.files[0], {
            tessedit_char_blacklist: '0123456789!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~', // Ignore numbers and special characters
            oem: 1
        });
        
        console.log(result)
        
        for(let i = 0; i < result.data.words.length; i++) {
            trie.insert(result.data.words[i].text.toLowerCase(), result.data.words[i].bbox)
        }
        const found = allergies.filter(allergy => trie.search(allergy));
        document.querySelector(".loader").style.display = "none"
        document.querySelector("#picture").src = URL.createObjectURL(image.files[0])
        res.innerHTML = found.length > 0 ? `Item has or may have${found.map((word) => ` ${word}`)}.` : "No Allergies";
    }
})

class Trie {
    constructor() {
        this.children = {};
    }

    insert(word, box) {
        let curr = this.children;
        for (let i = 0; i < word.length; i++) {
            if (curr[word[i]]) {
                curr = curr[word[i]];
            } else {
                curr = curr[word[i]] = {};
            }
        }
        curr["isWord"] = true;
        curr["box"] = box;
    }

    search(word) {
        let curr = this.children;
        for (let i = 0; i < word.length; i++) {
            if (curr[word[i]]) {
                curr = curr[word[i]];
            } else {
                return false;
            }
        }
        return curr["isWord"] ? true : false;
    }
}


// var Trie = function () {
//     this.children = {}
// };

// Trie.prototype.insert = function (word) {
//     let curr = this.children
//     for (let i = 0; i < word.length; i++) {
//         if (curr[word[i]]) {
//             curr = curr[word[i]];
//         } else {
//             curr = curr[word[i]] = {};
//             // curr = curr[word[i]];
//         }
//     }
//     curr["isWord"] = true;
// };


// Trie.prototype.search = function (word) {
//     let curr = this.children;
//     for (let i = 0; i < word.length; i++) {
//         if (curr[word[i]]) {
//             curr = curr[word[i]]
//         }
//         else {
//             return false;
//         }
//     }
//     return curr["isWord"] ? true : false
// };



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
