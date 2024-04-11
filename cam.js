document.addEventListener("DOMContentLoaded", async () => {
    const image = document.getElementById("image");
    const res = document.getElementById("result");
    const allergies = ["wheat", "barley", "rye", "gluten", "milk"]
    const worker = await Tesseract.createWorker();
    const trie = new Trie()

    allergies.forEach((allergy) => {
        trie.insert(allergy);
    })

    image.onchange = async () => {

        if(document.querySelector(".canvasImg")){
            document.querySelector(".canvasImg").remove()
        }

        document.querySelector("#picture").style.display = "block";
        const canvas = document.createElement('canvas');
        canvas.className = "canvasImg"
        canvas.style.maxWidth = "300px";
        canvas.style.maxHeight = "400px";

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
        
        // const found = [];
        const found = new Set()
        const boxes = [];
        // const data = {};

        for (let i = 0; i < result.data.words.length; i++) {
            const word = result.data.words[i].text.toLowerCase()
            if(trie.search(word)){
                boxes.push(result.data.words[i].bbox);
                found.add(word);
                // if(!data[word]){
                //     data[word] = i;
                //     found.push(word);
                // } 
            }
        }

        document.querySelector(".loader").style.display = "none"
        const cvimg = cv.imread("fileimg");
        boxes.forEach(box => {
            const x0 = box.x0, y0 = box.y0, x1 = box.x1, y1 = box.y1;
            const point1 = new cv.Point(x0, y0);
            const point2 = new cv.Point(x1, y1);
            cv.rectangle(cvimg, point1, point2, new cv.Scalar(255,0,0, 255), 3);
            document.querySelector("#picture").style.display = "none";
            document.querySelector(".image-div").append(canvas);
            cv.imshow(canvas, cvimg)
        });

        res.innerHTML = found.size > 0 ? `Item has or may have ${Array.from(found).map((allergy) => ` ${allergy}`)}.` : "No Allergies";
        imgfile.remove();
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

