export default defineAppConfig({
  ui: {
    colors: {
      primary: "drake",
      neutral: "neutral",
    },
    icons: {
      loading: "i-lucide-loader",
    },
    pageSection: {
      slots: {
        container: "py-8 sm:py-12 lg:py-14",
        title: "text-2xl md:text-3xl lg:text-4xl",
      },
    },
  },
  profile: {
    name: "Kings Hostel Management",
    job: "Software Developer | Designer",
    email: "kingshostelmgt@gmail.com",
    phone: "+233 54 968 4848",
    picture: "/images/hostel.jpg",
  },
  theme: {
    radius: 0.25,
    blackAsPrimary: false,
  },
});
