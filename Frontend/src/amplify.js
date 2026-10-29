
import { Amplify } from "aws-amplify";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: "ap-southeast-2_oJVhwibbf",
      userPoolClientId: "6k9s15pkg3d349ms24jjqkiek0",
      loginWith: {
        email: true,
      },
      signUpVerificationMethod: "code",
      userAttributes: {
        email: {
          required: true,
        },
        phone_number: {
          required: true,
        },
      },
    },
  },
});
