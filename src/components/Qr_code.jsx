import React, { useState } from "react";
import axios from "axios";
import QrScanner from "react-qr-scanner"; // Updated to react-qr-scanner
import jsQR from "jsqr"; // For decoding QR images
import alliedLogo from "../assets/AlliedLogo.png"; // Ensure this path is correct

const QRCodeComponent = () => {
  const [accessDetails, setAccessDetails] = useState({
    macAddress: "",
    encryptedData: "",
  });
  const [qrCodeData, setQrCodeData] = useState("");
  const [isScanning, setIsScanning] = useState(true);
  const [isLoadingPin, setIsLoadingPin] = useState(false);
  const [showPinPage, setShowPinPage] = useState(false);
  const [guid, setGuid] = useState("");
  const [pin, setPin] = useState(null);
  const [error, setError] = useState(null);

  // Parse QR code data
  const parseQrCodeData = (data) => {
    try {
      const parsed = JSON.parse(data);
      return {
        macAddress: parsed.macAddress || "N/A",
        encryptedData: parsed.encryptedData || "N/A",
      };
    } catch {
      setError("Invalid QR code format");
      return null;
    }
  };

  // Handle QR code scan result
  const handleQrCodeResult = async (result) => {
    if (!result) return;
    setQrCodeData(result.text);
    const parsedData = parseQrCodeData(result.text);
    if (!parsedData) return;

    setAccessDetails(parsedData);
    setIsScanning(false);

    try {
      const secretKeyData = await getSecretKey(parsedData.macAddress);
      const decryptedData = await decryptData(
        parsedData.macAddress,
        parsedData.encryptedData
      );
      setGuid(decryptedData.guid);
    } catch (err) {
      setError("Failed to process QR code");
    }
  };

  // Get secret key
  const getSecretKey = async (macAddress) => {
    try {
      const response = await axios.post(
        "http://192.168.3.210:8001/get-secret-key",
        { macAddress }
      );
      const secretKey = response.data.secretKey;
      if (secretKey) localStorage.setItem("secretKey", secretKey);
      return response.data;
    } catch {
      throw new Error("Failed to fetch secret key");
    }
  };

  // Decrypt data
  const decryptData = async (macAddress, encryptedData) => {
    try {
      const response = await axios.post("http://192.168.3.210:8001/decrypt", {
        macAddress,
        encryptedData,
      });
      return response.data;
    } catch {
      throw new Error("Decryption failed");
    }
  };

  // Generate PIN
  const generatePin = async (macAddress, guid, role, secretKey) => {
    try {
      const response = await axios.post(
        "http://192.168.3.210:8001/generate-pin",
        { macAddress, guid, role, secretKey }
      );
      return response.data.generated_pin;
    } catch {
      throw new Error("Failed to generate PIN");
    }
  };

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, canvas.width, canvas.height);

        if (code) handleQrCodeResult({ text: code.data });
        else setError("No QR code found in image");
      };
    };
    reader.readAsDataURL(file);
  };

  // Generate PIN click handler
  const handleGeneratePinClick = async () => {
    setIsLoadingPin(true);
    setError(null);
    const role = "admin"; // Replace with dynamic role if needed
    const secretKey = localStorage.getItem("secretKey");

    try {
      const generatedPin = await generatePin(
        accessDetails.macAddress,
        guid,
        role,
        secretKey
      );
      setPin(generatedPin);
      setShowPinPage(true);
    } catch {
      setError("Failed to generate PIN");
    } finally {
      setIsLoadingPin(false);
    }
  };

  // Reset scanner
  const resetScanner = () => {
    setIsScanning(true);
    setShowPinPage(false);
    setQrCodeData("");
    setAccessDetails({ macAddress: "", encryptedData: "" });
    setPin(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 flex flex-col items-center justify-center p-4 font-sans">
      {/* Logo */}
      <img
        src={alliedLogo}
        alt="Allied Medical Ltd Logo"
        className="w-24 h-24 mb-4 object-contain"
      />

      {/* Title */}
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">
        QR Code Access System
      </h1>

      {/* Main Content */}
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        {showPinPage ? (
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Your PIN</h2>
            <div className="flex space-x-2 mb-6">
              {pin?.toString().split("").map((digit, index) => (
                <div
                  key={index}
                  className="w-10 h-10 flex items-center justify-center text-lg font-bold bg-blue-100 text-blue-700 rounded-md"
                >
                  {digit}
                </div>
              ))}
            </div>
            <button
              onClick={resetScanner}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Scan Another QR Code
            </button>
          </div>
        ) : (
          <>
            {isScanning ? (
              <div className="flex flex-col items-center">
                <QrScanner
                  delay={300}
                  onError={(err) => setError(err.message)}
                  onScan={handleQrCodeResult}
                  style={{ width: "100%", }}
                  constraints={{
                    video: { facingMode: "environment" }, // Explicitly use rear camera
                  }}
                />
                <p className="text-gray-600 mt-4">Scan a QR code to proceed</p>
                <label className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg cursor-pointer hover:bg-green-600 transition">
                  Upload QR Image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                  QR Code Scanned
                </h2>
                <p className="text-gray-600 mb-4">
                  <strong>MAC Address:</strong> {accessDetails.macAddress}
                </p>
                {pin && (
                  <p className="text-gray-600 mb-4">
                    <strong>PIN:</strong> {pin}
                  </p>
                )}
                <button
                  onClick={handleGeneratePinClick}
                  disabled={isLoadingPin}
                  className={`px-4 py-2 text-white rounded-lg ${
                    isLoadingPin
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
                  } transition`}
                >
                  {isLoadingPin ? "Generating..." : "Generate PIN"}
                </button>
              </div>
            )}
          </>
        )}

        {/* Error Message */}
        {error && (
          <p className="text-red-500 text-center mt-4">{error}</p>
        )}
      </div>
    </div>
  );
};

export default QRCodeComponent;