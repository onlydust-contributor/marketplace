import { ComponentStory, ComponentMeta } from "@storybook/react";
import { JSXElementConstructor } from "react";
import Button, { ButtonSize } from ".";

export default {
  title: "Button",
  argTypes: {
    size: {
      control: {
        type: "select",
        options: [ButtonSize.Small, ButtonSize.Large],
      },
    },
  },
} as ComponentMeta<typeof Button>;

const Template: ComponentStory<JSXElementConstructor<typeof args>> = args => (
  <Button {...args}>
    <div>{args.text}</div>
  </Button>
);

export const Default = Template.bind({});

const args = {
  text: "Complete payment information",
};

Default.args = args;