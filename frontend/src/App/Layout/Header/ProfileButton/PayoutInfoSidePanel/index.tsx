import { useForm, SubmitHandler, FormProvider } from "react-hook-form";
import IBANParser from "iban";

import { useIntl } from "src/hooks/useIntl";
import {
  IdentityType,
  Maybe,
  PayoutSettingsType,
  UpdatePayoutSettingsMutationVariables,
  UserPayoutSettingsFragment,
} from "src/__generated/graphql";
import { useEffect } from "react";
import View from "./View";
import usePayoutSettings from "src/hooks/usePayoutSettings";
import { PayoutSettingsDisplayType, ProfileType, UserPayoutInfo } from "./types";
import SidePanel from "src/components/SidePanel";

const ENS_DOMAIN_REGEXP = /^[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)?$/gi;

type Props = {
  githubUserId?: number;
  open: boolean;
  setOpen: (value: boolean) => void;
};

export default function PayoutInfoSidePanel({ githubUserId, open, setOpen }: Props) {
  const { T } = useIntl();

  const {
    data: user,
    valid: payoutSettingsValid,
    updatePayoutSettings,
    updatePayoutSettingsLoading,
  } = usePayoutSettings(githubUserId);

  const formMethods = useForm<UserPayoutInfo>({
    mode: "onBlur",
    reValidateMode: "onBlur",
    shouldFocusError: true,
  });

  const { watch, handleSubmit, setValue, formState, reset } = formMethods;
  const { isDirty } = formState;

  useEffect(() => reset(decodeQuery(user)), [user]);

  const onSubmit: SubmitHandler<UserPayoutInfo> = formData => {
    updatePayoutSettings(mapFormDataToSchema(formData));
    // optimisticly set form's defaultValues to submitted form data to avoid flickering related to isDirty
    reset(formData);
  };

  const profileType = watch("profileType");

  useEffect(() => {
    if (profileType === ProfileType.Individual) {
      setValue("payoutSettingsType", PayoutSettingsDisplayType.EthereumIdentity);
    }
  }, [profileType]);

  return (
    <SidePanel open={open} setOpen={setOpen}>
      <div className="flex h-full flex-col">
        <div className="mx-6 border-b border-b-greyscale-50/8 pb-4 pt-8 font-belwe text-2xl font-normal text-greyscale-50">
          {T("navbar.profile.payoutInfo")}
        </div>

        <FormProvider {...formMethods}>
          <form id="payout-info-form" className="h-full min-h-0" onSubmit={handleSubmit(onSubmit)}>
            <View
              payoutSettingsValid={payoutSettingsValid}
              saveButtonDisabled={updatePayoutSettingsLoading || !isDirty}
              unsavedChanges={isDirty}
            />
          </form>
        </FormProvider>
      </div>
    </SidePanel>
  );
}

const mapFormDataToSchema = ({
  profileType,
  lastname,
  firstname,
  address,
  companyName,
  city,
  country,
  postCode,
  payoutSettingsType,
  ethIdentity,
  IBAN,
  BIC,
  identificationNumber,
}: UserPayoutInfo) => {
  const variables: UpdatePayoutSettingsMutationVariables = {
    identity: null,
    location: null,
    payoutSettings: null,
  };

  if (profileType === ProfileType.Individual && (firstname || lastname)) {
    variables.identity = {
      type: IdentityType.Person,
      optPerson: {
        firstname: firstname || null,
        lastname: lastname || null,
      },
      optCompany: null,
    };
  }
  if (profileType === ProfileType.Company && (firstname || lastname || companyName || identificationNumber)) {
    variables.identity = {
      type: IdentityType.Company,
      optCompany: {
        name: companyName || null,
        identificationNumber: identificationNumber || null,
        owner: {
          firstname: firstname || null,
          lastname: lastname || null,
        },
      },
      optPerson: null,
    };
  }

  if (address || postCode || city || country) {
    variables.location = {
      address: address || null,
      postCode: postCode || null,
      city: city || null,
      country: country || null,
    };
  }

  const payoutType =
    payoutSettingsType === PayoutSettingsDisplayType.BankAddress
      ? PayoutSettingsType.BankAddress
      : ethIdentity?.match(ENS_DOMAIN_REGEXP)
      ? PayoutSettingsType.EthereumName
      : PayoutSettingsType.EthereumAddress;

  if (payoutType === PayoutSettingsType.EthereumAddress && ethIdentity) {
    variables.payoutSettings = {
      optEthAddress: ethIdentity,
      optBankAddress: null,
      optEthName: null,
      type: PayoutSettingsType.EthereumAddress,
    };
  }
  if (payoutType === PayoutSettingsType.EthereumName && ethIdentity) {
    variables.payoutSettings = {
      optEthAddress: null,
      optBankAddress: null,
      optEthName: ethIdentity,
      type: PayoutSettingsType.EthereumName,
    };
  }
  if (payoutType === PayoutSettingsType.BankAddress && IBAN && BIC) {
    variables.payoutSettings = {
      optEthAddress: null,
      optBankAddress: { IBAN: IBANParser.electronicFormat(IBAN), BIC },
      optEthName: null,
      type: PayoutSettingsType.BankAddress,
    };
  }

  return { variables };
};

// Setting empty strings instead of undefined is required to make isDirty work properly
const decodeQuery = (user?: Maybe<UserPayoutSettingsFragment>): UserPayoutInfo => ({
  profileType: user?.identity?.Company ? ProfileType.Company : ProfileType.Individual,
  firstname:
    (user?.identity?.Company ? user?.identity?.Company?.owner?.firstname : user?.identity?.Person?.firstname) || "",
  lastname:
    (user?.identity?.Company ? user?.identity?.Company?.owner?.lastname : user?.identity?.Person?.lastname) || "",
  companyName: user?.identity?.Company?.name || "",
  identificationNumber: user?.identity?.Company?.identification_number || "",
  address: user?.location?.address || "",
  postCode: user?.location?.post_code || "",
  city: user?.location?.city || "",
  country: user?.location?.country || "",
  payoutSettingsType: user?.payoutSettings?.EthTransfer?.Address
    ? PayoutSettingsDisplayType.EthereumIdentity
    : user?.payoutSettings?.EthTransfer?.Domain
    ? PayoutSettingsDisplayType.EthereumIdentity
    : user?.payoutSettings?.WireTransfer
    ? PayoutSettingsDisplayType.BankAddress
    : PayoutSettingsDisplayType.EthereumIdentity,
  ethIdentity: user?.payoutSettings?.EthTransfer?.Address || user?.payoutSettings?.EthTransfer?.Name || "",
  IBAN: user?.payoutSettings?.WireTransfer?.IBAN
    ? IBANParser.printFormat(user?.payoutSettings?.WireTransfer?.IBAN)
    : "",
  BIC: user?.payoutSettings?.WireTransfer?.BIC || "",
});
