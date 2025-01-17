import { forwardRef, useEffect, useState } from "react";
import GithubIssue, { Action, WorkItem } from "src/components/GithubIssue";
import { useIntl } from "src/hooks/useIntl";
import { useShowToaster } from "src/hooks/useToaster";
import Link from "src/icons/Link";
import EmptyState from "src/pages/ProjectDetails/Rewards/RewardForm/WorkItemSidePanel/EmptyState";
import Toggle from "src/pages/ProjectDetails/Rewards/RewardForm/WorkItemSidePanel/Toggle";
import OtherIssueInput from "./OtherIssueInput";
import FormToggle from "src/components/FormToggle";
import { useForm, useWatch } from "react-hook-form";
import EyeOffLine from "src/icons/EyeOffLine";
import FormInput from "src/components/FormInput";
import SearchLine from "src/icons/SearchLine";
import { useFormContext } from "react-hook-form";
import useFilteredWorkItems from "./useFilteredWorkItems";
import { filter, some } from "lodash";
import { Virtuoso } from "react-virtuoso";
import { GithubIssueType } from "src/types";

const THEORETICAL_MAX_SCREEN_HEIGHT = 2000;

type Props = {
  projectId: string;
  issues: WorkItem[];
  type: GithubIssueType;
  onWorkItemAdded: (workItem: WorkItem) => void;
  onWorkItemIgnored: (workItem: WorkItem) => void;
  onWorkItemUnignored: (workItem: WorkItem) => void;
};

export default function View({
  projectId,
  issues,
  type,
  onWorkItemAdded,
  onWorkItemIgnored,
  onWorkItemUnignored,
}: Props) {
  const { T } = useIntl();
  const { watch, resetField } = useFormContext();
  const tabName = type === GithubIssueType.Issue ? "issues" : "pullRequests";

  const [addOtherIssueEnabled, setStateAddOtherIssueEnabled] = useState(false);
  const [searchEnabled, setStateSearchEnabled] = useState(false);
  const setAddOtherIssueEnabled = (value: boolean) => {
    setStateAddOtherIssueEnabled(value);
    setStateSearchEnabled(false);
  };
  const setSearchEnabled = (value: boolean) => {
    setStateSearchEnabled(value);
    setStateAddOtherIssueEnabled(false);
  };
  const showToaster = useShowToaster();

  const onIssueAdded = (item: WorkItem) => {
    onWorkItemAdded(item);
    showToaster(T(`reward.form.contributions.${tabName}.addedToaster`));
  };

  useEffect(() => {
    if (searchEnabled === false) resetField(`search-${tabName}`);
  }, [searchEnabled]);

  const showIgnoredItemsName = "show-ignored-items";
  const { control } = useForm({ defaultValues: { [showIgnoredItemsName]: false } });
  const showIgnoredItems = useWatch({
    control,
    name: showIgnoredItemsName,
  });

  const visibleIssues = showIgnoredItems ? issues : filter(issues, { ignored: false });

  const searchPattern = watch(`search-${tabName}`);
  const filteredIssues = useFilteredWorkItems({ pattern: searchPattern, workItems: visibleIssues });

  return (
    <div className="-mr-4 flex h-full flex-col gap-3 overflow-hidden px-6">
      <div className="mr-4 flex flex-col gap-3">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-row gap-3">
            <Toggle
              enabled={addOtherIssueEnabled}
              setEnabled={setAddOtherIssueEnabled}
              icon={<Link />}
              label={T(`reward.form.contributions.${tabName}.addOther.toggle`)}
              testId={`add-other-${tabName}-toggle`}
            />
            {issues.length > 0 && (
              <Toggle
                enabled={searchEnabled}
                setEnabled={setSearchEnabled}
                icon={<SearchLine />}
                label={T(`reward.form.contributions.${tabName}.search`)}
                testId="search-toggle"
              />
            )}
          </div>
          {some(issues, { ignored: true }) && (
            <div className="flex flex-row items-center gap-2 font-walsheim text-sm font-normal text-greyscale-50">
              <EyeOffLine />
              {T("reward.form.contributions.showIgnored")}
              <FormToggle name={showIgnoredItemsName} control={control} />
            </div>
          )}
        </div>
        {addOtherIssueEnabled && <OtherIssueInput projectId={projectId} type={type} onWorkItemAdded={onIssueAdded} />}
        {searchEnabled && (
          <FormInput
            name={`search-${tabName}`}
            placeholder={T(`reward.form.contributions.${tabName}.searchPlaceholder`)}
            withMargin={false}
            inputClassName="pl-10"
            prefixComponent={
              <div className="mt-0.5">
                <SearchLine className="text-xl text-spaceBlue-200" />
              </div>
            }
            inputProps={{ autoFocus: true }}
          />
        )}
      </div>
      {filteredIssues.length > 0 ? (
        <VirtualizedIssueList
          {...{ issues: filteredIssues, onIssueAdded, onWorkItemIgnored, onWorkItemUnignored, tabName }}
        />
      ) : (
        <div className="mr-4">
          <EmptyState />
        </div>
      )}
    </div>
  );
}

const Scroller = forwardRef<HTMLDivElement>((props, ref) => (
  <div
    className="overflow-auto scrollbar-thin scrollbar-thumb-white/12 scrollbar-thumb-rounded scrollbar-w-1.5"
    {...props}
    ref={ref}
  />
));

Scroller.displayName = "Scroller";

const ListBuilder = (tabName: string) => {
  const ListComponent = forwardRef<HTMLDivElement>((props, ref) => (
    <div className="mr-1.5 flex h-full flex-col gap-2 p-px" {...props} ref={ref} data-testid={`eligible-${tabName}`} />
  ));
  ListComponent.displayName = "List";
  return ListComponent;
};

interface VirtualizedIssueListProps {
  issues: WorkItem[];
  onIssueAdded: (workItem: WorkItem) => void;
  onWorkItemIgnored: (workItem: WorkItem) => void;
  onWorkItemUnignored: (workItem: WorkItem) => void;
  tabName: string;
}

const VirtualizedIssueList = ({
  issues,
  onIssueAdded,
  onWorkItemIgnored,
  onWorkItemUnignored,
  tabName,
}: VirtualizedIssueListProps) => {
  return (
    <Virtuoso
      data={issues}
      components={{ Scroller, List: ListBuilder(tabName) }}
      style={{ height: THEORETICAL_MAX_SCREEN_HEIGHT }}
      itemContent={(_, issue) => (
        <GithubIssue
          key={issue.id}
          workItem={issue}
          action={Action.Add}
          onClick={() => onIssueAdded(issue)}
          secondaryAction={issue.ignored ? Action.UnIgnore : Action.Ignore}
          onSecondaryClick={() => (issue.ignored ? onWorkItemUnignored(issue) : onWorkItemIgnored(issue))}
          ignored={issue.ignored}
          addMarginTopForVirtuosoDisplay={true}
        />
      )}
    />
  );
};
