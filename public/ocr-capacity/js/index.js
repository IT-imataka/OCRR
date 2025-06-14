const inpimg = document.getElementById("inpimg");

const ocrimg = (event) => {
  const worker = Tesseract.createWorker({
    workerPath:
      "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js",
    corePath:
      "https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.0/tesseract-core-simd.wasm.js",
    langPath: "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/lang/",
  });

  const imgfile = event.target.files[0];
  const canvas = document.getElementById("outimg");
  const ctx = canvas.getContext("2d");
  //ここからメモリ上だけで扱うimg要素を生成して以後このimg要素を加工する
  const img = new Image();
  // console.log(imgfile.width);
  //アップ画像のURLを生成
  img.src = URL.createObjectURL(imgfile);
  // img要素に画像が読み込まれたかを確認する用
  // 　console.log(img.width);
  const drawgird = () => {
    const cardwidth = 65;
    const cardheight = 25;
    const beginx = 537.5;
    const beginy = 235;
    const gapx = 10;
    const gapy = 80;
    const rows = 4;
    const cols = 10;
    const maindeck = [];
    const exdeck = [];

    //gridのスタイル
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;

    // grid生成
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const x = beginx + (cardwidth + gapx) * j;
        const y = beginy + (cardheight + gapy) * i;
        // grid描画
        ctx.strokeRect(x, y, cardwidth, cardheight);

        // メモリ上だけで切り出した各カードをcanvasに描画
        const maindeckcan = document.createElement("canvas");
        maindeckcan.width = cardwidth;
        maindeckcan.height = cardheight;
        const maindeckcanctx = maindeckcan.getContext("2d");
        maindeckcanctx.scale(1.1, 1.1);
        console.log(maindeckcanctx);
        maindeckcanctx.drawImage(
          canvas, // 描画元
          x, //切り抜くx座標
          y, //切り抜くy座標
          cardwidth, //切り抜き幅
          cardheight, //切り抜き高さ
          0, //配置座標
          0, //配置座標
          cardwidth, //配置サイズ
          cardheight //配置サイズ
        );
        maindeck.push(maindeckcan);
      }
    }
    const ocrcards = async function () {
      for (const card of maindeck) {
        const result = await Tesseract.recognize(card, "eng", {
          logger: () => {},
        });
        // const {data:{text:text}} = result;
        const text = result.data.text;
        console.log(text);
      }
    };
    ocrcards();
  };

  img.onload = () => {
    // console.log(ctx);
    canvas.width = img.width;
    canvas.height = img.height;

    ctx.drawImage(img, 0, 0);
    drawgird();

    const output = document.getElementById("output");
    const progressbar = document.createElement("progress");
    const progresstxt = document.createElement("span");
    progressbar.value = 0;
    progressbar.max = 100;
    output.appendChild(progressbar);
    output.appendChild(progresstxt);
    progresstxt.style = "margin-left:10px;";

    Tesseract.recognize(canvas, "jpn", {
      logger: (m) => {
        // console.log(m);
        if (m.status === "recognizing text") {
          const progress = Math.floor(m.progress * 1000);
          progressbar.value = progress / 10;
          progresstxt.innerText = `${progress / 10}%`;
        }
      },
    }).then(({ data: { text } }) => {
      output.innerHTML = text;
    });
  };
};
inpimg.addEventListener("change", ocrimg);
