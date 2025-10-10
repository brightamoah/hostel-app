export default defineAppConfig({
  ui: {
    colors: {
      primary: "fuchsia",
      neutral: "neutral",
    },
    icons: {
      loading: "i-lucide-loader",
    },
    // modal: {
    //   variants: {
    //     fullscreen: {
    //       false: {
    //         content: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-4xl max-h-[90vh] rounded-lg shadow-lg ring ring-default overflow-hidden",
    //       },
    //     },
    //   },
    // },
  },
  profile: {
    name: "Kings Hostel Management",
    job: "Software Developer | Designer",
    email: "kingshostelmgt@gmail.com",
    phone: "+233 54 968 4848",
    picture: "/images/hostel.jpg",
  },
});
