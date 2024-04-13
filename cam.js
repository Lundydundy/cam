document.addEventListener("DOMContentLoaded", async () => {
    const image = document.getElementById("image");
    const res = document.getElementById("result");
    const displayImg = document.querySelector("#picture");
    const allergies = ["wheat", "barley", "rye", "gluten", "milk"];
    localStorage.setItem("allergens", allergies);
    const worker = await Tesseract.createWorker();
    const trie = createTrie(allergies);
    document.querySelector(".allergens").innerHTML = `Checking for ${allergies.map((allergy) => ` ${allergy}`)}`;

    image.onchange = async () => {

        const imgfile = await loadImage(image);

        if (imgfile) {
            checkForCanvas();
            const canvas = createCanvas();

            res.style.display = "none";
            document.querySelector(".loader").style.display = "block";

            let result = await worker.recognize(displayImg, {
                tessedit_char_blacklist: '0123456789!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~', // Ignore numbers and special characters
                oem: 1
            });

            const newImg = cv.imread(imgfile)
            cv.imshow(canvas, newImg);
            console.log("second");

            result = await worker.recognize(canvas.toDataURL(), {
                tessedit_char_blacklist: '0123456789!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~', // Ignore numbers and special characters
                oem: 1
            });

            console.log("complete");


            const allergens = retrieveFoundAllergens(result, trie);
            res.style.display = "block"
            document.querySelector(".loader").style.display = "none";
            createBoxes(canvas, allergens.boxes);

            res.innerHTML = allergens.found.size > 0 ? `Item has or may have ${Array.from(allergens.found).map((allergy) => ` <strong>${allergy}</strong>`)}.` : "No Allergies";
            imgfile.remove();
        }
    }
})

class Trie {
    constructor() {
        this.children = {};
    }

    insert(word) {
        let curr = this.children;
        for (let i = 0; i < word.length; i++) {
            if (curr[word[i]]) {
                curr = curr[word[i]];
            } else {
                curr = curr[word[i]] = {};
            }
        }
        curr["isWord"] = true;
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
        return curr["isWord"];
    }
}
function createTrie(allergies) {
    const trie = new Trie()
    allergies.forEach((allergy) => {
        trie.insert(allergy);
    })
    return trie;
}
async function loadImage(filename) {
    if (!filename) return null;
    document.querySelector("#picture").src = URL.createObjectURL(filename.files[0]);
    const imgfile = document.createElement('img')
    imgfile.src = URL.createObjectURL(image.files[0]);
    imgfile.id = "fileimg";
    document.body.appendChild(imgfile)
    imgfile.style.display = "none"
    return imgfile;
}
function checkForCanvas() {
    if (document.querySelector(".canvasImg")) {
        document.querySelector(".canvasImg").remove()
    }
}
function createCanvas() {
    document.querySelector("#picture").style.display = "block";
    const canvas = document.createElement('canvas');
    canvas.className = "canvasImg"
    canvas.style.maxWidth = "350px";
    canvas.style.maxHeight = "400px";
    return canvas;
}
function retrieveFoundAllergens(result, trie) {

    const found = new Set();
    const boxes = [];

    for (let i = 0; i < result.data.words.length; i++) {
        const word = result.data.words[i].text.toLowerCase()
        if (trie.search(word)) {
            boxes.push(result.data.words[i].bbox);
            found.add(word);
        }
    }

    return { found: found, boxes: boxes }
}
function createBoxes(canvas, boxes) {
    const cvimg = cv.imread("fileimg");
    boxes.forEach(box => {
        const x0 = box.x0, y0 = box.y0, x1 = box.x1, y1 = box.y1;
        const point1 = new cv.Point(x0 - 5, y0 - 5);
        const point2 = new cv.Point(x1, y1);
        cv.rectangle(cvimg, point1, point2, new cv.Scalar(255, 0, 0, 255), 3);
        document.querySelector("#picture").style.display = "none";
        document.querySelector(".image-div").append(canvas);
        cv.imshow(canvas, cvimg)
    });
}
