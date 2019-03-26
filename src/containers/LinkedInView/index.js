/**
 * @providesModule LinkedInModal
 * @flow
 */

import React from "react";
import {
  WebView,
  TouchableOpacity,
  View,
  ViewPropTypes,
  Text,
  Modal,
  StyleSheet,
  Image
  // $DisableFlow
} from "react-native";
import PropTypes from "prop-types";
import { pipe, evolve, propSatisfies, applySpec, propOr } from "ramda";
import { v4 } from "uuid";
import querystring from "query-string";

const AUTHORIZATION_URL: string =
  "https://www.linkedin.com/uas/oauth2/authorization";
const ACCESS_TOKEN_URL: string =
  "https://www.linkedin.com/uas/oauth2/accessToken";

export type LinkedInToken = {
  access_token?: string,
  expires_in?: number
};

export type ErrorType = {
  type?: string,
  message?: string
};

type State = {
  raceCondition: boolean,
  modalVisible: boolean,
  authState: string
};

/* eslint-disable */
type Props = {
  clientID: string,
  clientSecret: string,
  redirectUri: string,
  onSuccess: (LinkedInToken | {}) => void,
  onError: ErrorType => void,
  authState?: string,
  onOpen?: void => void,
  onClose?: void => void,
  onSignIn?: void => void,
  permissions: Array<string>,
  linkText?: string,
  renderButton?: void => any,
  renderClose?: void => any,
  containerStyle?: any,
  wrapperStyle?: any,
  closeStyle?: any,
  animationType?: "none" | "fade" | "slide",
  shouldGetAccessToken: boolean
};
/* eslint-enable */

export const cleanUrlString = (state: string) => state.replace("#!", "");

export const getCodeAndStateFromUrl: string => Object = pipe(
  querystring.extract,
  querystring.parse,
  evolve({ state: cleanUrlString })
);

export const getErrorFromUrl: string => Object = pipe(
  querystring.extract,
  querystring.parse,
  evolve({ error_description: cleanUrlString })
);

export const transformError: Object => Object = applySpec({
  type: propOr("", "error"),
  message: propOr("", "error_description")
});

export const isErrorUrl: string => boolean = pipe(
  querystring.extract,
  querystring.parse,
  propSatisfies(error => typeof error !== "undefined", "error")
);

export const getAuthorizationUrl: Props => string = ({
  authState,
  clientID,
  permissions,
  redirectUri
}) =>
  `${AUTHORIZATION_URL}?${querystring.stringify({
    response_type: "code",
    client_id: clientID,
    scope: permissions.join(" ").trim(),
    state: authState,
    redirect_uri: redirectUri
  })}`;

export const getPayloadForToken: (Props & { code: string }) => string = ({
  clientID,
  clientSecret,
  code,
  redirectUri
}) =>
  querystring.stringify({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: clientID,
    client_secret: clientSecret
  });

export const injectedJavaScript = () =>
  'document.querySelector("input[type=text]").setAttribute("autocapitalize", "off")';

export const fetchToken: string => Promise < LinkedInToken > = async payload => {
  const response = await fetch(ACCESS_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: payload
  });
  return await response.json();
};

export const logError = (error: ErrorType) =>
  // eslint-disable-next-line
  console.error(JSON.stringify(error, null, 2));

export const onLoadStart = async (
  url: string,
  authState: string,
  onSuccess: Function,
  onError: Function,
  close: Function,
  getAccessToken: (token: string) => Promise<LinkedInToken | {}>,
  shouldGetAccessToken: boolean
) => {
  if (isErrorUrl(url)) {
    const err = getErrorFromUrl(url);
    close();
    onError(transformError(err));
  } else {
    const { code, state } = getCodeAndStateFromUrl(url);
    if (!shouldGetAccessToken) {
      onSuccess(code);
    } else if (state !== authState) {
      onError({
        type: "state_not_match",
        message: `state is not the same ${state}`
      });
    } else {
      const token: LinkedInToken | {} = await getAccessToken(code);
      onSuccess(token);
    }
  }
};

const styles = StyleSheet.create({
  constainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    // paddingVertical: 40,
    // paddingHorizontal: 10
  },
  wrapper: {
    flex: 1,
    borderRadius: 5,
    // borderWidth: 3,
    borderColor: "rgba(0, 0, 0, 0.6)"
  },
  close: {
    position: "absolute",
    top: 8,
    right: 5,
    backgroundColor: "#000",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "rgba(0, 0, 0, 0.4)",
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center"
  }
});

export default class LinkedInModal extends React.Component {
  static propTypes = {
    clientID: PropTypes.string.isRequired,
    clientSecret: PropTypes.string.isRequired,
    redirectUri: PropTypes.string.isRequired,
    permissions: PropTypes.array,
    authState: PropTypes.string,
    onSuccess: PropTypes.func.isRequired,
    onError: PropTypes.func,
    onOpen: PropTypes.func,
    onClose: PropTypes.func,
    onSignIn: PropTypes.func,
    linkText: PropTypes.string,
    renderButton: PropTypes.func,
    renderClose: PropTypes.func,
    containerStyle: ViewPropTypes.style,
    wrapperStyle: ViewPropTypes.style,
    closeStyle: ViewPropTypes.style,
    // animationType: Modal.propTypes.animationType,
    shouldGetAccessToken: PropTypes.bool
  };
  static defaultProps = {
    onError: logError,
    permissions: ["r_basicprofile", "r_emailaddress"],
    linkText: "Login with LinkedIn",
    animationType: "fade",
    containerStyle: StyleSheet.create({}),
    wrapperStyle: StyleSheet.create({}),
    closeStyle: StyleSheet.create({}),
    shouldGetAccessToken: true
  };
  state: State = {
    raceCondition: false,
    modalVisible: false,
    authState: v4()
  };

  componentWillUpdate(nextProps: Props, nextState: State) {
    if (
      nextState.modalVisible !== this.state.modalVisible &&
      nextState.modalVisible === true
    ) {
      const authState = nextProps.authState || v4();
      this.setState(() => ({ raceCondition: false, authState }));
    }
  }

  onLoadStart = async ({ nativeEvent: { url } }: Object) => {
    const { raceCondition } = this.state;
    const { redirectUri, onError, shouldGetAccessToken } = this.props;

    if (url.includes(redirectUri) && !raceCondition) {
      const { onSignIn, onSuccess } = this.props;
      const { authState } = this.state;
      this.setState({ modalVisible: false, raceCondition: true });
      if (onSignIn) onSignIn();
      await onLoadStart(
        url,
        authState,
        onSuccess,
        onError,
        this.close,
        this.getAccessToken,
        shouldGetAccessToken
      );
    }
  };

  getAuthorizationUrl: void => string = () =>
    getAuthorizationUrl({ ...this.props, authState: this.state.authState });

  getAccessToken: string => Promise<LinkedInToken | {} > = async (
    code: string
  ) => {
    const { onError } = this.props;
    const payload: string = getPayloadForToken({ ...this.props, code });
    const token = await fetchToken(payload);
    if (token.error) {
      onError(transformError(token));
      return {};
    }
    return token;
  };

props: Props;

close = () => {
  const { onClose } = this.props;
  if (onClose) onClose();
  this.setState({ modalVisible: false });
};

open = () => {
  const { onOpen } = this.props;
  if (onOpen) onOpen();
  this.setState({ modalVisible: true });
};

renderButton = () => {
  const { renderButton, linkText } = this.props;
  if (renderButton) return renderButton();
  return <Text>{linkText}</Text>;
};

renderClose = () => {
  const { renderClose } = this.props;
  if (renderClose) return renderClose();
  return (
    // $DisableFlow
    <Image source={require("./assets/x-white.png")} resizeMode="contain" />
  );
};

renderWebview = () => {
  const { modalVisible } = this.state;
  if (!modalVisible) return null;

  return (
    <WebView
      source={{ uri: this.getAuthorizationUrl() }}
      onLoadStart={this.onLoadStart}
      startInLoadingState
      onNavigationStateChange={a => {
        if (a.url.includes("code=")) {

          fetch(
            `https://www.linkedin.com/oauth/v2/accessToken?grant_type=authorization_code&code=${a.url.split("code=")[1]}&redirect_uri=${this.props.redirectUri}&client_id=${this.props.clientID}&client_secret=${this.props.clientSecret}`
          ).then((res) => {
            return res.json()
          }).then((res) => {
            fetch("https://api.linkedin.com/v2/me?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams))", {
              headers: {
                Authorization: "Bearer " + res.access_token
              }
            }).then((profileRes) => profileRes.json()).then((profile) => {

              fetch("https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))",
                {
                  headers: {
                    Authorization: "Bearer " + res.access_token
                  }
                }
              ).then((email) => email.json()).then((emailJson) => {
                let displayImage = profile["profilePicture"]["displayImage~"]["elements"];
                let photo = displayImage[displayImage.length - 1]["identifiers"][0]["identifier"];
                let fName = profile["firstName"]["localized"]["en_US"];
                let lName = profile["lastName"]["localized"]["en_US"];
                let email = emailJson["elements"][0]["handle~"]["emailAddress"];

                this.props.onSuccess({
                  ...profile,
                  token: res.access_token,
                  email,
                  photo,
                  fName,
                  lName,
                });
                this.props.loading(false);
              }).catch((err) => {
                this.props.onError(err)
                this.props.loading(false);
              })

            }).catch((err) => {
              this.props.onError(err)
              this.props.loading(false);
            })
            // console.log(res)
          }).catch((err) => {
            this.props.onError(err);
            this.props.loading(false);
          })
          this.close();
          this.props.loading(true);
        }
      }}
      javaScriptEnabled
      domStorageEnabled
      injectedJavaScript={injectedJavaScript()}
    />
  );
};

render() {
  const { modalVisible } = this.state;
  const {
    animationType,
    containerStyle,
    wrapperStyle,
    closeStyle
  } = this.props;
  return (
    <View>
      <TouchableOpacity onPress={this.open}>
        {this.renderButton()}
      </TouchableOpacity>
      <Modal
        animationType={animationType}
        transparent
        visible={modalVisible}
        onRequestClose={this.close}
      >
        <View style={[styles.constainer, containerStyle]}>
          <View style={[styles.wrapper, wrapperStyle]}>
            {this.renderWebview()}
          </View>
          <TouchableOpacity
            onPress={this.close}
            style={[styles.close, closeStyle]}
          >
            {this.renderClose()}
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
}
