import { rates } from "src/hooks/useWorkEstimation";
import { generatePath, useNavigate } from "react-router-dom";
import View, { Contributor } from "./View";
import { ProjectRewardsRoutePaths, ProjectRoutePaths, RoutePaths } from "src/App";
import { ContributorFragment } from "src/__generated/graphql";
import { viewportConfig } from "src/config";
import { useMediaQuery } from "usehooks-ts";
import { ViewMobile } from "./ViewMobile";

type Props = {
  contributors: ContributorFragment[];
  isProjectLeader: boolean;
  remainingBudget: number;
  projectKey: string;
};

export default function ContributorsTable({
  contributors: contributorFragments,
  isProjectLeader,
  remainingBudget,
  projectKey,
}: Props) {
  const isXl = useMediaQuery(`(min-width: ${viewportConfig.breakpoints.xl}px)`);

  const contributors = contributorFragments.map(c => {
    return {
      githubUserId: c.githubUserId,
      login: c.login || "",
      avatarUrl: c.avatarUrl || "",
      userId: c.userId,
      totalEarned: c.paymentStatsAggregate.aggregate?.sum?.moneyGranted || 0,
      paidContributionsCount: c.contributionStatsAggregate.aggregate?.sum?.paidCount || 0,
      unpaidMergedPullsCount: c.contributionStatsAggregate.aggregate?.sum?.unpaidUnignoredCount || 0,
    } as Contributor;
  });

  const navigate = useNavigate();

  const isSendingNewPaymentDisabled = remainingBudget < rates.hours;

  const onPaymentRequested = (contributor: Contributor) => {
    if (!isSendingNewPaymentDisabled) {
      navigate(
        generatePath(RoutePaths.ProjectDetails, { projectKey }) +
          "/" +
          ProjectRoutePaths.Rewards +
          "/" +
          ProjectRewardsRoutePaths.New,
        {
          state: { recipientGithubLogin: contributor.login },
        }
      );
    }
  };

  return isXl ? (
    <View
      {...{
        contributors,
        isProjectLeader,
        remainingBudget,
        onRewardGranted: onPaymentRequested,
      }}
    />
  ) : (
    <ViewMobile contributors={contributors} />
  );
}
