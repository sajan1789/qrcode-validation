import React, { useEffect, useState } from "react";
import axios from "axios";
import { QrReader } from "react-qr-reader"; // Import QR code scanner
import jsQR from "jsqr"; // Import jsQR for decoding QR images
import alliedLogo from "../assets/AlliedLogo.png";

const QRCodeComponent = () => {
  const [accessDetails, setAccessDetails] = useState({
    macAddress: "",
    encryptedData: "",
    pin: "",
    token: "",
  });

  const [qrCodeData, setQrCodeData] = useState("");
  const [isScanning, setIsScanning] = useState(true);
  const [isLoadingPin, setIsLoadingPin] = useState(false); // Loading state for PIN
  const [showPinPage, setShowPinPage] = useState(false); // State to navigate to the PIN page
  const [guid, setGuid] = useState("");
  const [encryptedData, setEncryptedData] = useState("");
  const [pin, setPin] = useState(null);
  const [secretKey, setSecretKey] = useState("");

  // Function to handle QR code scan result
  let parsedData = {};

  const handleQrCodeResult = (result) => {
    if (result) {
      setQrCodeData(result);
      parsedData = parseQrCodeData(result);
    }
    if (parsedData && !qrCodeData) {
      setAccessDetails((prevDetails) => ({
        ...prevDetails,
        macAddress: parsedData.macAddress,
        encryptedData: parsedData.encryptedData,
      }));

      // Call getSecretKey and perform further actions after it resolves
      getSecretKey(parsedData.macAddress)
        .then((data) => {})
        .catch((err) => console.error("Failed to get secret key:", err));
      // Example: Call decryptData function or any other logic
      decryptData(parsedData.macAddress, parsedData.encryptedData)
        .then((decryptedData) => {
          setEncryptedData()
        })
        .catch((err) => console.error("Decryption failed:", err));
    }
    setIsScanning(false);
  };

  // for getting secret key
  const getSecretKey = async (macAddress) => {
    try {
      // Make the POST request
      const response = await axios.post(
        "http://192.168.3.210:8001/get-secret-key",
        {
          macAddress, // Pass macAddress in the request body
        }
      );

      // Assuming the response contains secretKey in the data
      const secretKey = response.data.secretKey;

      if (secretKey) {
        // Store secretKey in localStorage
        localStorage.setItem("secretKey", secretKey);
      } else {
      }

      // Return the data if needed
      return response.data;
    } catch (error) {}
  };

  // Function to parse QR code data
  const parseQrCodeData = (data) => {
    try {
      const parsed = JSON.parse(data);
      return {
        macAddress: parsed.macAddress || "N/A",
        encryptedData: parsed.encryptedData || "N/A",
      };
    } catch (error) {
      return null;
    }
  };

  // Function to fetch PIN
  const generatePin = async (macAddress, guid, role, secretKey) => {
    try {
      const response = await axios.post(
        "http://192.168.3.210:8001/generate-pin",
        {
          macAddress, // Pass macAddress in the request body
          guid, // Pass guid in the request body
          role, // Pass role in the request body
          secretKey, // Pass secretKey in the request body
        }
      );

      // Log the response data (PIN)
      console.log("Generated PIN:", response.data.generated_pin);

      // Return the PIN if needed
      return response.data.generated_pin;
    } catch (error) {
      console.error("Error generating PIN:", error.message);
      throw new Error("Failed to generate PIN");
    }
  };

  // Function to handle QR image upload
  const handleImageUpload = async (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const img = new Image();
      img.src = e.target.result;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);

        const imageData = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );
        const code = jsQR(imageData.data, canvas.width, canvas.height);

        if (code) {
          handleQrCodeResult(code.data);
        }
      };
    };

    reader.readAsDataURL(file);
  };
 
  const decryptData = async (macAddress, encryptedData) => {
    try {
      // Send POST request to /decrypt endpoint
      const response = await axios.post("http://192.168.3.210:8001/decrypt", {
        macAddress, // MAC address to be passed in the request body
        encryptedData, // Encrypted data to be passed in the request body
      });
      console.log("Decrypted Data:", response.data.decryptedData); // Log the decrypted data
      if (response) {
        setGuid(response.data.guid); // setting guid for further use
      }
     
      return response.data.decryptedData;
      // You can return the decrypted data or handle it as needed
    } catch (error) {
      // Handle errors gracefully

      throw new Error("Decryption failed: " + error.message); // Throwing error for higher-level handling
    }
  };

  // Function to reset scanner
  const resetScanner = () => {
    setIsScanning(true);
    setShowPinPage(false);
    setQrCodeData("");
    setAccessDetails((prevDetails) => ({
      ...prevDetails,
      macAddress: "",
      encryptedData: "",
    }));
  };

  //to generate pin
  const handleGeneratePinClick = async () => {
    setIsLoadingPin(true); // Set loading state to true
    // setError(null);  // Reset any previous errors
    // const role = JSON.parse(localStorage.getItem("userData"));
    const role = "admin"; // Assuming role is passed as a prop or stored in localStorage
    const secretKey = localStorage.getItem("secretKey");
    try {
      const generatedPin = await generatePin(
        accessDetails.macAddress,
        guid,
        role,
        secretKey
      );

      setPin(generatedPin); // Update the state with the generated PIN
    } catch (err) {
      setError("Failed to generate PIN. Please try again."); // Set error state if something goes wrong
    } finally {
      setIsLoadingPin(false); // Set loading state to false after request is complete
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center p-6 bg-gray-100  overflow-hidden"
      style={{ overflow: "hidden" }} // Disable scrolling
    >
      <div className="flex justify-center">
        <img
          src={alliedLogo}
          alt="Allied Medical Ltd Logo"
          className="w-32 h-32 object-contain "
        />
      </div>
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        QR Code Access System
      </h1>

      {/* Show PIN Page */}
      {showPinPage ? (
        <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
          <h2 className="text-2xl font-medium text-gray-800 mb-4">
            6-Digit PIN
          </h2>
          <div className="flex space-x-4">
            {accessDetails.pin.split("").map((digit, index) => (
              <div
                key={index}
                className="w-12 h-12 flex items-center justify-center text-xl font-bold bg-blue-100 text-blue-700 rounded-lg shadow-md"
              >
                {digit}
              </div>
            ))}
          </div>
          <button
            onClick={resetScanner}
            className="mt-6 px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:ring-4 focus:ring-blue-300"
          >
            Scan Another QR Code
          </button>
        </div>
      ) : (
        <>
          {/* Logo in Main Content */}

          {/* QR Code Scanner Section */}
          {isScanning ? (
            <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
              <QrReader
                onResult={(result, error) => {
                  if (result) {
                    handleQrCodeResult(result?.text);
                  }
                  if (error) {
                    console.error("QR Scanner Error:", error.message);
                  }
                }}
                constraints={{ facingMode: "environment" }}
                className="w-80 h-80"
              />
              <h2 className="text-lg font-medium text-gray-700 mt-4">
                Scan QR Code
              </h2>
              <label
                htmlFor="qr-image-upload"
                className="mt-4 px-4 py-2 text-white bg-green-500 rounded-lg cursor-pointer hover:bg-green-600 focus:ring-4 focus:ring-green-300"
              >
                Upload QR Image
                <input
                  type="file"
                  id="qr-image-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
              <h2 className="text-lg font-medium text-gray-700 mb-4">
                QR Code Scanned Successfully!
              </h2>
              <h2 className="text-lg font-medium text-gray-700 mb-4">
                Pin: {pin}
              </h2>
              <button
                className={`mt-4 px-4 py-2 text-white rounded-lg ${
                  isLoadingPin
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
                disabled={isLoadingPin} // Disable button when loading
                onClick={handleGeneratePinClick} // Call the function on click
              >
                Generate Pin
              </button>
            </div>
          )}

          {/* Information Section */}
          <div className="bg-white mt-6 p-6 rounded-lg shadow-lg w-full max-w-lg">
            <p className="text-sm text-gray-600 mb-2">
              <strong>MAC Address:</strong>{" "}
              <span className="block bg-gray-200 p-2 rounded-lg">
                {accessDetails.macAddress || "N/A"}
              </span>
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default QRCodeComponent;
