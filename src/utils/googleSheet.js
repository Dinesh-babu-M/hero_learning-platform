// utils/googleSheet.js

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyZKRaGHdvVxCSM3HmfRUSGX_9GoRkZ24gEqLbhgpdt7cW2OUoUOe9GebmDVdRJV73m/exec"; // Replace with your deployed Web App URL

export const registerUser = async (formData) => {
  const payload = { ...formData, action: "register" };
  const response = await fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return await response.json();
};

export const loginUser = async (credentials) => {
  const payload = { ...credentials, action: "login" };
  const response = await fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return await response.json();
};
export const getAICredentials = () => {
  return {
    apiKey: "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",
    apiUrl: "https://openrouter.ai/api/v1/chat/completions",
    model: "mistralai/mistral-7b-instruct:free"
  };
};



// // const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyZKRaGHdvVxCSM3HmfRUSGX_9GoRkZ24gEqLbhgpdt7cW2OUoUOe9GebmDVdRJV73m/exec"; // Replace with your link

// // export const loginUser = async ({ email, password }) => {
// //   const payload = { action: "login", email, password };
// //   const res = await fetch(GOOGLE_SCRIPT_URL, {
// //     method: "POST",
// //     body: JSON.stringify(payload),
// //   });
// //   return await res.json();
// // };

// import axios from "axios";

// const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyZKRaGHdvVxCSM3HmfRUSGX_9GoRkZ24gEqLbhgpdt7cW2OUoUOe9GebmDVdRJV73m/exec"; // Replace with your link


// // Login User
// export const loginUser = async ({ email, password }) => {
//   try {
//     const response = await axios.post(GOOGLE_SCRIPT_URL, {
//       action: "login",
//       email,
//       password,
//     });

//     return response.data;
//     console.log("")
//   } catch (error) {
//     console.error("Login Error:", error);
//     return { success: false, message: "Login failed. Please try again." };
//   }
// };

// // Register User
// export const registerUser = async (formData) => {
//   try {
//     const payload = { ...formData, action: "register" };
//     const response = await axios.post(GOOGLE_SCRIPT_URL, payload);
//     return response.data;
//   } catch (error) {
//     console.error("Registration Error:", error);
//     return { success: false, message: "Registration failed. Please try again." };
//   }
// };

