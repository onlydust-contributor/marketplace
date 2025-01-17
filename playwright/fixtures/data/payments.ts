import { PaymentFixture } from "../../types";
import { EthereumIdentityType } from "../../__generated/graphql";

const coolRepoAId = 602953043;

export const payments: PaymentFixture[] = [
  {
    project: "ProjectA",
    recipientGithubId: 595505,
    requestor: "TokioRs",
    items: [
      {
        amount: 100,
        reason: {
          workItems: [
            { repoId: coolRepoAId, issueNumber: 1 },
            { repoId: coolRepoAId, issueNumber: 2 },
          ],
        },
        receipts: [
          {
            amount: 100,
            currencyCode: "ETH",
            recipientETHIdentity: {
              type: EthereumIdentityType.EthereumAddress,
              optEthAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
              optEthName: null,
            },
            transactionHashOrReference: "0x5b48f0c340e70e63c011ca41495ff423b9a4fe6975c58df0f066d80fe4d2dcca",
          },
        ],
      },
      {
        amount: 100,
        reason: {
          workItems: [{ repoId: coolRepoAId, issueNumber: 1 }],
        },
      },
      {
        amount: 500,
        reason: {
          workItems: [{ repoId: coolRepoAId, issueNumber: 1 }],
        },
      },
      {
        amount: 500,
        reason: {
          workItems: [{ repoId: coolRepoAId, issueNumber: 1 }],
        },
      },
      {
        amount: 2000,
        reason: {
          workItems: [{ repoId: coolRepoAId, issueNumber: 1 }],
        },
      },
      {
        amount: 10000,
        reason: {
          workItems: [{ repoId: coolRepoAId, issueNumber: 1 }],
        },
      },
    ],
  },
  {
    project: "ProjectA",
    recipientGithubId: 21149076,
    requestor: "TokioRs",
    items: [
      {
        amount: 200,
        reason: {
          workItems: [{ repoId: coolRepoAId, issueNumber: 3 }],
        },
      },
    ],
  },
];
