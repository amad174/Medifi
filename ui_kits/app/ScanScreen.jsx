/* Medifi — Scan/Paste screen. Camera capture, image upload, OCR, paste text,
 * or pick a sample letter, then "Make my plan". */
(function () {
  const { Button, Input } = window.MedifiDesignSystem_063852;
  const Icon = window.Icon;
  const OCR = window.MedifiOCR;
  const Matcher = window.MedifiLetterMatcher;

  function CameraView({ onCancel, onCapture, reading, error }) {
    const videoRef = React.useRef(null);
    const streamRef = React.useRef(null);
    const [cameraReady, setCameraReady] = React.useState(false);
    const [cameraError, setCameraError] = React.useState(error || "");

    React.useEffect(() => {
      if (reading) return undefined;
      let cancelled = false;

      async function startCamera() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setCameraError("Your browser does not support the camera. Use upload image instead.");
          return;
        }
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
            audio: false,
          });
          if (cancelled) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          streamRef.current = stream;
          const video = videoRef.current;
          if (video) {
            video.srcObject = stream;
            await video.play();
            setCameraReady(true);
            setCameraError("");
          }
        } catch (err) {
          setCameraError(
            err.name === "NotAllowedError"
              ? "Camera access was blocked. Allow camera permission or upload an image instead."
              : "Could not open the camera. Try uploading an image instead."
          );
        }
      }

      startCamera();
      return function cleanup() {
        cancelled = true;
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
      };
    }, [reading]);

    function takePhoto() {
      const video = videoRef.current;
      if (!video || !video.videoWidth) return;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0);
      canvas.toBlob(function (blob) {
        if (blob) onCapture(blob);
      }, "image/jpeg", 0.92);
    }

    return (
      <div className="mf-cam">
        <div className="mf-cam__top">
          <button type="button" className="mf-cam__btn" aria-label="Cancel" onClick={onCancel} disabled={reading}>
            <Icon name="x" size={22} />
          </button>
          <span className="t">{reading ? "Reading…" : "Take a photo"}</span>
          <span style={{ width: 40 }} />
        </div>

        <div className="mf-cam__view">
          {!reading && !cameraError && (
            <React.Fragment>
              <video ref={videoRef} className="mf-cam__video" playsInline muted />
              <div className="mf-cam__frame"><span></span><span></span><span></span><span></span></div>
              {!cameraReady && <p className="mf-cam__hint">Starting camera…</p>}
              {cameraReady && <p className="mf-cam__hint">Line up the whole letter inside the frame</p>}
            </React.Fragment>
          )}
          {cameraError && !reading && (
            <div className="mf-cam__error">
              <Icon name="alert" size={28} />
              <p>{cameraError}</p>
            </div>
          )}
          {reading && (
            <React.Fragment>
              <div className="mf-scanline"></div>
              <div className="mf-cam__reading">
                <p className="t">Reading your letter…</p>
                <p className="s">Finding the date, place, and what to do next.</p>
              </div>
            </React.Fragment>
          )}
        </div>

        <div className="mf-cam__bar">
          {!reading && cameraReady && !cameraError && (
            <button type="button" className="mf-cam__shutter" aria-label="Take photo" onClick={takePhoto}></button>
          )}
        </div>
      </div>
    );
  }

  function ImagePreview({ url, name, progress, error, onRemove }) {
    return (
      <div className="mf-img-preview">
        <img src={url} alt="Uploaded letter" className="mf-img-preview__img" />
        <div className="mf-img-preview__meta">
          <span className="mf-img-preview__name">{name}</span>
          {progress != null && !error && (
            <span className="mf-img-preview__progress">Reading text… {progress}%</span>
          )}
          {error && <span className="mf-img-preview__error">{error}</span>}
          {!progress && !error && (
            <button type="button" className="mf-link" onClick={onRemove}>Remove image</button>
          )}
        </div>
      </div>
    );
  }

  function ScanScreen({ onAnalyze }) {
    const [text, setText] = React.useState("");
    const [picked, setPicked] = React.useState(null);
    const [mode, setMode] = React.useState("form");
    const [imageUrl, setImageUrl] = React.useState("");
    const [imageName, setImageName] = React.useState("");
    const [ocrProgress, setOcrProgress] = React.useState(null);
    const [ocrError, setOcrError] = React.useState("");
    const [busy, setBusy] = React.useState(false);

    const cameraInputRef = React.useRef(null);
    const fileInputRef = React.useRef(null);
    const imageUrlRef = React.useRef("");

    React.useEffect(function () {
      imageUrlRef.current = imageUrl;
      return function () {
        if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current);
      };
    }, [imageUrl]);

    function clearImage() {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
      setImageUrl("");
      setImageName("");
      setOcrProgress(null);
      setOcrError("");
    }

    function pickSample(letter) {
      clearImage();
      setText(letter.original);
      setPicked(letter);
    }

    function analyzeFromText(rawText, letterOverride) {
      const trimmed = (rawText || "").trim();
      if (!trimmed) return;
      const letter = letterOverride || (picked && picked.original === trimmed ? picked : Matcher.letterFromExtractedText(trimmed));
      onAnalyze(letter);
    }

    function analyze() {
      analyzeFromText(text, picked);
    }

    function isImageFile(file) {
      if (!file) return false;
      if (file.type && file.type.startsWith("image/")) return true;
      return /\.(jpe?g|png|gif|webp|bmp|heic|heif)$/i.test(file.name || "");
    }

    async function processImageFile(file) {
      if (!isImageFile(file)) {
        setOcrError("Please choose a photo or image file (JPEG, PNG, or WebP).");
        return false;
      }

      clearImage();
      setPicked(null);
      setBusy(true);
      setOcrError("");
      setOcrProgress(0);

      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setImageName(file.name || "Letter photo");

      try {
        const extracted = await OCR.readImage(file, setOcrProgress);
        if (!extracted) {
          setOcrError("Could not read any text from this image. Try a clearer photo or paste the text.");
          setBusy(false);
          setOcrProgress(null);
          return false;
        }
        setText(extracted);
        setPicked(null);
        setOcrProgress(null);
        setBusy(false);
        analyzeFromText(extracted);
        return true;
      } catch (err) {
        setOcrError(err.message || "Could not read this image. Try again or paste the text.");
        setBusy(false);
        setOcrProgress(null);
        return false;
      }
    }

    function handleFileChange(e) {
      const file = e.target.files && e.target.files[0];
      e.target.value = "";
      if (file) processImageFile(file);
    }

    async function handleCameraCapture(blob) {
      setMode("reading");
      const file = new File([blob], "letter-photo.jpg", { type: "image/jpeg" });
      const ok = await processImageFile(file);
      if (!ok) setMode("form");
    }

    function openCamera() {
      setMode("camera");
    }

    function openFilePicker() {
      fileInputRef.current?.click();
    }

    function openNativeCamera() {
      cameraInputRef.current?.click();
    }

    if (mode === "camera" || mode === "reading") {
      return (
        <CameraView
          reading={mode === "reading" || busy}
          onCancel={() => setMode("form")}
          onCapture={handleCameraCapture}
        />
      );
    }

    return (
      <div className="mf-screen">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/bmp,image/heic,image/heif,.heic,.heif"
          className="mf-sr-only"
          onChange={handleFileChange}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="mf-sr-only"
          onChange={handleFileChange}
        />

        <div className="mf-tiles mf-tiles--scan">
          <button type="button" className="mf-tile" onClick={openCamera}>
            <span className="mf-tile__icon"><Icon name="camera" size={26} /></span>
            <span className="mf-tile__t">Take a photo</span>
            <span className="mf-tile__s">Use your device camera</span>
          </button>
          <button type="button" className="mf-tile mf-tile--alt" onClick={openFilePicker}>
            <span className="mf-tile__icon"><Icon name="file" size={26} /></span>
            <span className="mf-tile__t">Upload image</span>
            <span className="mf-tile__s">Choose a photo from your files</span>
          </button>
          <button type="button" className="mf-tile mf-tile--alt" onClick={openNativeCamera}>
            <span className="mf-tile__icon"><Icon name="scan" size={26} /></span>
            <span className="mf-tile__t">Quick camera</span>
            <span className="mf-tile__s">Opens your phone camera app</span>
          </button>
        </div>

        {imageUrl && (
          <ImagePreview
            url={imageUrl}
            name={imageName}
            progress={ocrProgress}
            error={ocrError}
            onRemove={clearImage}
          />
        )}

        {ocrError && !imageUrl && (
          <div className="mf-banner">
            <Icon name="alert" size={20} />
            <span>{ocrError}</span>
          </div>
        )}

        <div className="mf-section">
          <p className="mf-section__label">Or try a sample letter</p>
          <div className="mf-chips">
            {window.MEDIFI_LETTERS.map((l) => (
              <button key={l.id} type="button"
                className={"mf-chip" + (picked && picked.id === l.id ? " mf-chip--on" : "")}
                onClick={() => pickSample(l)}>
                {l.chip}
              </button>
            ))}
          </div>
        </div>

        <div className="mf-paste-wrap">
          <Input id="mf-paste" multiline label="Letter text"
            placeholder="Paste the words from your NHS letter, text message, or email here…"
            value={text} onChange={(e) => { setText(e.target.value); setPicked(null); }} />
        </div>

        <Button variant="primary" size="lg" fullWidth disabled={!text.trim() || busy}
          iconLeft={<Icon name="sparkle" size={20} />} onClick={analyze}>
          {busy ? "Reading your letter…" : "Make my plan"}
        </Button>
        <p className="mf-disclaimer">Medifi helps you understand and organise letters. Always check against your original letter.</p>
      </div>
    );
  }
  window.ScanScreen = ScanScreen;
})();
