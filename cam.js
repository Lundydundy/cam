document.addEventListener("DOMContentLoaded", async () => {
    const image = document.getElementById("image");
    const res = document.getElementById("result");
    const allergies = ["wheat", "barley", "rye", "gluten", "milk"]
    const worker = await Tesseract.createWorker();

    image.onchange = async () => {
        const trie = new Trie()
        if(document.querySelector(".canvasImg")){
            document.querySelector(".canvasImg").remove()
        }
        document.querySelector("#picture").style.display = "block";
        const canvas = document.createElement('canvas');
        canvas.className = "canvasImg"
        canvas.style.width = "300px";
        canvas.style.height = "400px";

        document.querySelectorAll(".bounding-box").forEach((element) => {
            element.remove();
        })
        document.querySelector("#picture").src = URL.createObjectURL(image.files[0]);
        const imgfile = document.createElement('img')
        imgfile.src = URL.createObjectURL(image.files[0]);
        imgfile.id = "fileimg";
        document.body.appendChild(imgfile)
        imgfile.style.display = "none"
        document.querySelector(".loader").style.display = "block"
        
        const result = await worker.recognize(document.querySelector("#picture"), {
            tessedit_char_blacklist: '0123456789!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~', // Ignore numbers and special characters
            oem: 1
        });
    
        for (let i = 0; i < result.data.words.length; i++) {
            trie.insert(result.data.words[i].text.toLowerCase(), result.data.words[i].bbox)
        }
        const found = allergies.filter(allergy => trie.search(allergy)[0]);
        const boxes = []
        allergies.forEach((allergy) => {
            const data = trie.search(allergy);
            data[0] ? boxes.push(data[1]) : null;
        })

        console.log(boxes);

        document.querySelector(".loader").style.display = "none"
        const cvimg = cv.imread("fileimg");
        boxes.forEach(box => {
            const x0 = box.x0, y0 = box.y0, x1 = box.x1, y1 = box.y1;
            const point1 = new cv.Point(x0, y0);
            const point2 = new cv.Point(x1, y1);
            cv.rectangle(cvimg, point1, point2, new cv.Scalar(255,0,0, 255), 5);
            document.querySelector("#picture").style.display = "none";
            document.querySelector(".image-div").append(canvas);
            cv.imshow(canvas, cvimg)
        });

        res.innerHTML = found.length > 0 ? `Item has or may have${found.map((word) => ` ${word}`)}.` : "No Allergies";
        imgfile.remove();
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
        return curr["isWord"] ? [true, curr.box] : false;
    }
}
