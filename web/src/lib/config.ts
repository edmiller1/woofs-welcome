const config = {
  appName: "Woofs Welcome",
  appDescription: "Discover NZ's dog-friendly places.",
  domainName:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://woofs-welcome.app",
};

export default config;
