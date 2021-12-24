import React, { useCallback, useState } from "react";
import styled, { useTheme } from "styled-components/native";

import { ActivityIndicator, TouchableOpacity, TouchableOpacityProps } from "react-native";
import { buttonSizeStyle, getButtonColorStyle } from "../../cta/Button/getButtonStyle";
import { ctaIconSize, ctaTextType } from "../../cta/getCtaStyle";
import Text from "../../Text";
import baseStyled, { BaseStyledProps } from "../../styled";

export type ButtonProps = TouchableOpacityProps &
  BaseStyledProps & {
    Icon?: React.ComponentType<{ size: number; color: string }> | null;
    type?: "main" | "shade" | "error" | "color" | "default";
    size?: "small" | "medium" | "large";
    iconPosition?: "right" | "left";
    outline?: boolean;
    disabled?: boolean;
    pressed?: boolean;
    children?: React.ReactNode;
  };

const IconContainer = styled.View<{
  iconPosition: "right" | "left";
  iconButton?: boolean;
}>`
  ${(p) =>
    p.iconButton ? "" : p.iconPosition === "left" ? `margin-right: 10px;` : `margin-left: 10px;`}
`;

export const Base = baseStyled(TouchableOpacity).attrs<ButtonProps>((p) => ({
  ...getButtonColorStyle(p.theme.colors, p).button,
  // Avoid conflict with styled-system's size property by nulling size and renaming it
  size: undefined,
  sizeVariant: p.size,
}))<
  {
    iconButton?: boolean;
    sizeVariant?: ButtonProps["size"];
  } & Omit<ButtonProps, "size">
>`

  border-radius: ${(p) => p.theme.space[10]}px;
  padding: 0 ${(p) => p.theme.space[7]}px;
  flex-direction: row;
  border-style: solid;
  text-align: center;
  align-items: center;
  justify-content: center;
  align-content: center;
  overflow: hidden;
  position: relative;
  ${(p) => buttonSizeStyle[p.sizeVariant || "medium"]}

  ${(p) => (p.iconButton ? `padding: 0; width: ${p.theme.space[10]}px;` : "")}
`;

const Container = styled.View<{
  hide?: boolean;
}>`
  flex-direction: row;
  text-align: center;
  align-items: center;
  justify-content: center;
  align-content: center;
  opacity: ${(p) => (p.hide ? 0 : 1)};
`;

const SpinnerContainer = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const ButtonContainer = (props: ButtonProps & { hide?: boolean }): React.ReactElement => {
  const { Icon, iconPosition = "right", children, hide = false, size = "medium" } = props;
  const theme = useTheme();
  const { text } = getButtonColorStyle(theme.colors, props);
  return (
    <Container hide={hide}>
      {iconPosition === "right" && children ? (
        <Text variant={ctaTextType[size]} fontWeight={"semiBold"} color={text.color}>
          {children}
        </Text>
      ) : null}
      {Icon ? (
        <IconContainer iconButton={!children} iconPosition={iconPosition}>
          <Icon size={ctaIconSize[size]} color={text.color} />
        </IconContainer>
      ) : null}
      {iconPosition === "left" && children ? (
        <Text variant={ctaTextType[size]} fontWeight={"semiBold"} color={text.color}>
          {children}
        </Text>
      ) : null}
    </Container>
  );
};

const Button = (props: ButtonProps): React.ReactElement => {
  const { Icon, children, type = "default" } = props;
  return (
    <Base {...props} type={type} iconButton={!!Icon && !children} activeOpacity={0.5}>
      <ButtonContainer {...props} type={type} />
    </Base>
  );
};

export const PromisableButton = (props: ButtonProps): React.ReactElement => {
  const { Icon, children, onPress, type = "main", disabled = false } = props;

  const [spinnerOn, setSpinnerOn] = useState(false);
  const theme = useTheme();

  const onPressHandler = useCallback(
    async (event) => {
      if (!onPress) return;
      setSpinnerOn(true);
      try {
        await onPress(event);
      } finally {
        setSpinnerOn(false);
      }
    },
    [onPress],
  );

  return (
    <Base
      {...props}
      type={type}
      iconButton={!!Icon && !children}
      disabled={disabled || spinnerOn}
      onPress={onPressHandler}
    >
      <ButtonContainer {...props} type={type} hide={spinnerOn} />
      <SpinnerContainer>
        <ActivityIndicator color={theme.colors.neutral.c50} animating={spinnerOn} />
      </SpinnerContainer>
    </Base>
  );
};

export default Button;
