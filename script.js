const isPerm = navigator.mediaDevices.getUserMedia({video:{width: 279, height:395}})
window.onload = () => {
    onScanColorClick()
}
function startVideo() {
    const specs = {}

    isPerm.then(stream => {
        
        const videoElement = document.querySelector('#video')
        videoElement.srcObject = stream

    }).catch(error=> {
        console.log(error);
    })
}

window.addEventListener("DOMContentLoaded", startVideo())

function menuShow() {
    
    let menuMobile = document.querySelector('.mobile-menu');

    if (menuMobile.classList.contains('open')) {
        menuMobile.classList.remove('open');
    }
    else{
        menuMobile.classList.add('open');
    }
}

let onScanColorClick = () => {
    const video = document.createElement("video")
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d", {willReadFrequently: true})

    isPerm.then((stream) => {
            video.srcObject = stream
            video.play()
        })
        .catch((err) => {
            console.log(err)
        })

    video.addEventListener("canplay", () => {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        setInterval(() => {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
            const image = new Image()
            image.src = canvas.toDataURL()
            image.onload = () => convertImage(image)
        }, 5000)
    })
}

let convertImage = (image) => {
    const canvas = drawImageToCanvas(image)
    const ctx = canvas.getContext("2d", {willReadFrequently: true})

    let map = new Map()
    for(let y = 0; y < canvas.height; y++) {
        for(let x = 0; x < canvas.width; x++) {
            let data = ctx.getImageData(x, y, 1, 1).data;
            if(data[3] == 0) continue;
            let key = `#${Array.from(data).map(i2hex).join("").toUpperCase()}`
            // let key = Buffer.from(data).toString('hex')
            // console.log(key);
            if(map.has(key)) {
                map.set(key, map.get(key) + 1)
            } else {
                map.set(key, 1)
            }
        }
    }
    
    let mostKey = ""
    let mostVal = 0
    for(const [key, val] of map) {
        if(val > mostVal) {
            mostKey = key
            mostVal = val
        }
    }

    var hex = document.getElementById("hex").textContent = mostKey
    document.getElementById("result").style.backgroundColor = mostKey

    var rgb = document.getElementById("result").style.backgroundColor.toString()
    document.getElementById("rgb").textContent = rgb
    var newRgb = rgb.replace(/\s*,\s*/g, ",");

    var uriApiColor = "https://www.thecolorapi.com/id?rgb=" + newRgb

    var dataColor = fetch(uriApiColor).then(response => response.json())

    dataColor.then(data => {
        let colorName = data.name.value
        let apiUrlToTranslateColor = `https://api.mymemory.translated.net/get?q=${colorName}&langpair=en|pt-br`

        fetch(apiUrlToTranslateColor).then(response => response.json()).then(data => {
            let colorNameTranslated = data.responseData.translatedText
            document.getElementById("colorName").textContent = colorNameTranslated.toUpperCase()
        })
    })

    talk();
}

let i2hex = (i) => {
    return ('0' + i.toString(16)).slice(-2);
} 

let drawImageToCanvas = (image) => {
    const canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height
    canvas.getContext('2d', {willReadFrequently: true}).drawImage(image, 0, 0, image.width, image.height)
    return canvas
}

function talk(){
    var speech = new SpeechSynthesisUtterance();
    speech.lang = "pt-BR";
    speech.text = document.getElementById("colorName").textContent;
    speech.volume = 1;
    speech.rate = 1;
    speech.pitch = 1;
    window.speechSynthesis.speak(speech);
}