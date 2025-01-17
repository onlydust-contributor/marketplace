import classNames from "classnames";
import { useState } from "react";
import Dot from "src/assets/icons/Dot";
import Button, { ButtonType, ButtonSize } from "src/components/Button";
import { useIntl } from "src/hooks/useIntl";
import { useSidePanel } from "src/hooks/useSidePanel";
import ErrorWarningLine from "src/icons/ErrorWarningLine";
import LogoutBoxRLine from "src/icons/LogoutBoxRLine";
import MoneyDollarCircleLine from "src/icons/MoneyDollarCircleLine";
import User3Line from "src/icons/User3Line";
import PayoutInfoSidePanel from "./PayoutInfoSidePanel";
import { useGetPaymentRequestIdsQuery } from "src/__generated/graphql";
import { NavLink } from "react-router-dom";
import { RoutePaths } from "src/App";
import Folder3Line from "src/icons/Folder3Line";
import ExchangeDollarLine from "src/icons/ExchangeDollarLine";
import SidePanel from "src/components/SidePanel";
import ContributorProfileSidePanel from "src/hooks/useContributorProfilePanel/ContributorProfileSidePanel";

type Props = {
  avatarUrl: string | null;
  login: string;
  logout: () => void;
  showMissingPayoutSettingsState: boolean;
  githubUserId?: number;
  hideProfileItems?: boolean;
};

export default function ViewMobile({
  avatarUrl,
  logout,
  showMissingPayoutSettingsState,
  githubUserId,
  hideProfileItems,
}: Props) {
  const { T } = useIntl();

  const [payoutInfoSidePanelOpen, setPayoutInfoSidePanelOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [contributorPanelOpen, setContributorPanelOpen] = useState(false);

  const { openFullTermsAndConditions, openPrivacyPolicy } = useSidePanel();

  const { data: paymentRequestIdsQueryData } = useGetPaymentRequestIdsQuery({
    variables: { githubUserId },
    skip: !githubUserId,
  });
  const hasRewards = paymentRequestIdsQueryData?.githubUsersByPk?.paymentRequests.length || 0 > 0;

  return (
    <>
      <button
        onClick={() => setPanelOpen(true)}
        className={classNames(
          "border-1 flex items-center justify-center gap-2 rounded-full border px-2 py-1.5 font-walsheim text-sm",
          {
            "border-greyscale-50/12": !showMissingPayoutSettingsState,
            "border-orange-500": showMissingPayoutSettingsState,
          }
        )}
      >
        {avatarUrl && <img className="h-8 w-8 rounded-full" src={avatarUrl} />}
        {showMissingPayoutSettingsState && <ErrorWarningLine className="text-xl text-orange-500" />}
      </button>
      <SidePanel withBackdrop open={panelOpen} setOpen={setPanelOpen} hasCloseButton={false}>
        <div className="flex flex-col divide-y divide-greyscale-50/8 bg-whiteFakeOpacity-5 p-3 font-walsheim text-sm">
          {!hideProfileItems && (
            <>
              {hasRewards && (
                <div className="flex flex-col">
                  <NavLink
                    to={RoutePaths.Projects}
                    onClick={() => setPanelOpen(false)}
                    className={({ isActive }) =>
                      classNames("flex items-center gap-3 rounded-xl p-4", { "bg-white/8": isActive })
                    }
                  >
                    <Folder3Line className="text-xl" /> {T("navbar.projects")}
                  </NavLink>
                  <NavLink
                    to={RoutePaths.Rewards}
                    onClick={() => setPanelOpen(false)}
                    className={({ isActive }) =>
                      classNames("flex items-center gap-3 rounded-xl p-4", { "bg-white/8": isActive })
                    }
                  >
                    <ExchangeDollarLine className="text-xl" /> {T("navbar.rewards")}
                  </NavLink>
                </div>
              )}
              <>
                <button className="flex items-center gap-3 p-4" onClick={() => setContributorPanelOpen(true)}>
                  <User3Line className="text-xl" /> {T("navbar.profile.publicProfile")}
                </button>
                <button className="flex items-center gap-3 p-4" onClick={() => setPayoutInfoSidePanelOpen(true)}>
                  <MoneyDollarCircleLine className="text-xl" /> {T("navbar.profile.payoutInfo")}
                  {showMissingPayoutSettingsState && <Dot className="w-1.5 fill-orange-500" />}
                </button>
              </>
            </>
          )}
          <div className="flex w-full flex-row items-center justify-between p-4">
            <div className="flex flex-row gap-1 text-xs font-normal text-spaceBlue-200">
              <button onClick={openFullTermsAndConditions}>{T("navbar.termsAndConditions")}</button>
              <div>{T("navbar.separator")}</div>
              <button onClick={openPrivacyPolicy}>{T("navbar.privacyPolicy")}</button>
            </div>
            <Button type={ButtonType.Secondary} size={ButtonSize.Xs} onClick={logout} data-testid="logout-button">
              <LogoutBoxRLine className="border-greyscale-50 text-sm" />
              {T("navbar.logout")}
            </Button>
          </div>
        </div>
        <PayoutInfoSidePanel
          githubUserId={githubUserId}
          open={payoutInfoSidePanelOpen}
          setOpen={setPayoutInfoSidePanelOpen}
        />
        {githubUserId && (
          // We cannot use the ContributorProfileSidePanelProvider here as headless-ui is unable to auto focus the panel when it opens.
          // See https://github.com/tailwindlabs/headlessui/discussions/2578
          <ContributorProfileSidePanel
            githubUserId={githubUserId}
            open={contributorPanelOpen}
            setOpen={setContributorPanelOpen}
          />
        )}
      </SidePanel>
    </>
  );
}
