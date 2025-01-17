import onlyDustLogo from "assets/img/onlydust-logo-space.jpg";
import Card from "src/components//Card";
import RoundedImage from "src/components//RoundedImage";
import PayoutStatus from "src/components/PayoutStatus";
import { useIntl } from "src/hooks/useIntl";
import ArrowRightSLine from "src/icons/ArrowRightSLine";
import MoneyDollarCircleLine from "src/icons/MoneyDollarCircleLine";
import TimeLine from "src/icons/TimeLine";
import displayRelativeDate from "src/utils/displayRelativeDate";
import { pretty } from "src/utils/id";
import { formatMoneyAmount } from "src/utils/money";
import { Reward as Reward } from "./Line";
import { ReactNode } from "react";

export default function MobileUserRewardList({
  rewards,
  payoutInfoMissing,
  invoiceNeeded,
  onRewardClick,
}: {
  rewards: Reward[];
  payoutInfoMissing: boolean;
  invoiceNeeded: boolean;
  onRewardClick: (reward: Reward) => void;
}) {
  const { T } = useIntl();

  return (
    <div className="flex flex-col gap-4">
      {rewards.map(reward => (
        <button onClick={() => onRewardClick(reward)} key={reward.id}>
          <MobileUserRewardItem
            title={reward?.project?.title}
            image={<RoundedImage src={reward?.project?.logoUrl || onlyDustLogo} alt={reward?.project?.title || ""} />}
            request={T("reward.table.reward", { id: pretty(reward.id), count: reward.workItems.length })}
            amount={formatMoneyAmount({ amount: reward.amount.value, currency: reward.amount.currency })}
            date={reward.requestedAt}
            payoutStatus={
              <PayoutStatus
                {...{
                  id: `payout-status-${reward.id}`,
                  status: reward.status,
                  payoutInfoMissing,
                  invoiceNeeded: invoiceNeeded && !reward.invoiceReceived,
                }}
              />
            }
          />
        </button>
      ))}
    </div>
  );
}

export function MobileUserRewardItem({
  image,
  title,
  request,
  amount,
  date,
  payoutStatus,
}: {
  image: ReactNode;
  title?: string | null;
  request: string;
  amount: string;
  date: Date;
  payoutStatus: ReactNode;
}) {
  const { T } = useIntl();

  return (
    <Card className="flex flex-col gap-3 divide-y divide-greyscale-50/8" selectable>
      <div className="flex flex-col gap-3">
        {payoutStatus}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {image}
            <div className="flex flex-col items-start">
              <div className="font-belwe text-base font-normal">{title}</div>
              <div className="text-sm text-spaceBlue-200">{request}</div>
            </div>
          </div>
          <ArrowRightSLine className="text-xl text-spaceBlue-200" />
        </div>
      </div>

      <div className="flex gap-4 divide-x divide-greyscale-50/8 pt-3 font-walsheim text-sm">
        <div className="flex w-1/2 flex-col items-start">
          <div className="flex items-center gap-1 font-semibold uppercase text-spaceBlue-200">
            <MoneyDollarCircleLine className="text-base font-medium" />
            {T("reward.table.amount")}
          </div>
          {amount}
        </div>

        <div className="flex flex-col items-start pl-4 text-left">
          <div className="flex items-center gap-1 font-semibold uppercase text-spaceBlue-200">
            <TimeLine className="text-base font-medium" />
            {T("reward.table.date")}
          </div>
          {displayRelativeDate(date)}
        </div>
      </div>
    </Card>
  );
}
