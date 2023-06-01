import { useUserProfileQuery } from "src/__generated/graphql";
import View, { HeaderColor } from "./View";
import { contextWithCacheHeaders } from "src/utils/headers";
import { Project } from "./ProjectCard";
import { unionBy } from "lodash";

type Props = {
  githubUserId: number;
  open: boolean;
  setOpen: (value: boolean) => void;
};

export default function ContributorProfileSidePanel({ githubUserId, ...rest }: Props) {
  const { data } = useUserProfileQuery({ variables: { githubUserId }, ...contextWithCacheHeaders });
  const userProfile = data?.userProfiles.at(0);
  const projects: Project[] = unionBy(
    userProfile?.projectsLeaded.map(
      project =>
        ({
          id: project.projectId,
          name: project.project?.projectDetails?.name || "",
          logoUrl: project.project?.projectDetails?.logoUrl || "",
          leadSince: new Date(project.assignedAt + "Z"),
          contributorCount: project.project?.contributorsAggregate.aggregate?.count || 0,
          totalGranted: project.project?.budgetsAggregate.aggregate?.sum?.spentAmount || 0,
        } as Project)
    ),
    userProfile?.projects.map(project => ({
      id: project.projectId,
      name: project.project?.projectDetails?.name || "",
      logoUrl: project.project?.projectDetails?.logoUrl || "",
      contributionCount: project.contributionCount,
      lastContribution: project.maxContributionDate,
      contributorCount: project.project?.contributorsAggregate.aggregate?.count || 0,
      totalGranted: project.project?.budgetsAggregate.aggregate?.sum?.spentAmount || 0,
    })),
    "id"
  );

  return userProfile ? (
    <View profile={userProfile} projects={projects} {...rest} headerColor={HeaderColor.Blue} />
  ) : (
    <div />
  );
}