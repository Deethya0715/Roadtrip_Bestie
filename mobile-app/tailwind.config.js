/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        perryTeal: '#008080',
        jakeYellow: '#FFD525',
        slytherinEmerald: '#043927',
        meanGirlsPink: '#E53D74',
        laLaPeach: '#FF7F50',
      },
    },
  },
  plugins: [],
}
