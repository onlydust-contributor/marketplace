import { ComponentStory } from "@storybook/react";

import ContributorSelectView from "src/pages/ProjectDetails/Rewards/RewardForm/ContributorSelect/View";
import { Contributor } from "src/pages/ProjectDetails/Rewards/RewardForm/types";

export default {
  title: "ContributorsSelect",
};

const filteredContributors: Contributor[] = [
  {
    githubUserId: 1111,
    login: "antho",
    avatarUrl: "https://avatars.githubusercontent.com/u/43467246?v=4",
    unpaidMergedPullsCount: 3,
  },
  {
    githubUserId: 2222,
    login: "stan",
    avatarUrl: "https://avatars.githubusercontent.com/u/4435377?v=4",
    userId: "user-1",
    unpaidMergedPullsCount: 0,
  },
  {
    githubUserId: 3333,
    login: "ofux",
    avatarUrl: "https://avatars.githubusercontent.com/u/595505?v=4",
    unpaidMergedPullsCount: 10,
  },
];

const filteredExternalContributors: Contributor[] = [
  {
    githubUserId: 4444,
    login: "oscar",
    avatarUrl: "https://avatars.githubusercontent.com/u/21149076?v=4",
    unpaidMergedPullsCount: 0,
    userId: "user-4",
  },
  {
    githubUserId: 5555,
    login: "gregoire",
    avatarUrl: "https://avatars.githubusercontent.com/u/8642470?v=4",
    unpaidMergedPullsCount: 0,
    userId: "user-5",
  },
  {
    githubUserId: 6666,
    login: "timothee",
    avatarUrl: "https://avatars.githubusercontent.com/u/34384633?v=4",
    unpaidMergedPullsCount: 0,
    userId: "user-6",
  },
];

const Template: ComponentStory<typeof ContributorSelectView> = () => {
  return (
    <div className="relative w-full">
      <ContributorSelectView {...args} />
    </div>
  );
};

const args = {
  selectedGithubHandle: "test",
  setSelectedGithubHandle: Function.prototype(),
  githubHandleSubstring: "test",
  setGithubHandleSubstring: Function.prototype(),
  filteredContributors,
  filteredExternalContributors,
  isSearchGithubUsersByHandleSubstringQueryLoading: false,
  contributor: filteredContributors[0],
  debouncedGithubHandleSubstring: "test",
};

export const Default = Template.bind({});
Default.args = args;
