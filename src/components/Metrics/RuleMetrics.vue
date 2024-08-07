<template>
  <div class="ms-4">
    <!-- Page Title -->
    <div class="col-md-2 pt-2 text-start page-title">
      <h3><small class="text-nowrap">RULE METRICS</small></h3>
    </div>

    <SpinnerVue v-if="!loadedData" />

    <div class="row pl-3 mt-4 me-0 mr-0">
      <div class="col-md-4">
        <RulePackFilter
          :rulePackPreSelected="selectedVersionsList"
          :rulePackOptions="allRulePackVersions"
          @on-rule-pack-version-change="onRulePackVersionChange"
        />
      </div>
      <div class="col-md-4">
        <RuleTagsFilter
          ref="ruleTagsFilterChildComponent"
          :ruleTagsOptions="ruleTagsList"
          :ruleTagsSelected="selectedRuleTags"
          @on-rule-tags-change="onRuleTagsFilterChange"
        />
      </div>
    </div>
    <div class="row pl-3 pt-3 me-0 mr-0">
      <div class="col-md-4 text-start">
        <BFormCheckbox
          v-model="includeDeletedRepositories"
          name="check-button"
          switch
          @change="fetchRulesWithFindingStatusCount"
        >
          <small class="text-nowrap">Include data from repositories marked as deleted.</small>
        </BFormCheckbox>
      </div>
    </div>

    <!--Rule Metrics Table -->
    <div v-if="!hasRecords && loadedData" class="text-center cursor-default">
      <br />
      <br />No Record Found...
    </div>

    <div class="row pt-3 me-0 mr-0" v-if="hasRecords">
      <BTable
        id="rule-metrics-table"
        :no-border-collapse="true"
        :items="ruleList"
        :fields="fields"
        primary-key="rule_name"
        responsive
        small
        head-variant="light"
        @row-clicked="goToRuleAnalysisPage"
      >
        <!-- True Positive Rate Column -->
        <template #cell(true_positive_rate)="data">
          {{ calculateTruePositiveRate(data) }}
        </template>

        <!-- True Positive Count Column -->
        <template #cell(true_positive)="data">
          <span
            v-for="(item, i) in (data.item as RuleFindingCountModel).finding_statuses_count"
            :key="i"
          >
            <span v-if="item.status == 'TRUE_POSITIVE'">
              {{ item.count }}
            </span>
          </span>
        </template>

        <!-- False Positive Count Column -->
        <template #cell(false_positive)="data">
          <span v-for="(item, i) in data.item.finding_statuses_count" :key="i">
            <span v-if="(item as StatusCount).status == 'FALSE_POSITIVE'">
              {{ (item as StatusCount).count }}
            </span>
          </span>
        </template>

        <!-- Clarification Required Count Column -->
        <template #cell(clarification_required)="data">
          <span v-for="(item, i) in data.item.finding_statuses_count" :key="i">
            <span v-if="(item as StatusCount).status == 'CLARIFICATION_REQUIRED'">
              {{ (item as StatusCount).count }}
            </span>
          </span>
        </template>

        <!-- Outdated Count Column -->
        <template #cell(outdated)="data">
          <span v-for="(item, i) in data.item.finding_statuses_count" :key="i">
            <span v-if="(item as StatusCount).status == 'OUTDATED'">
              {{ (item as StatusCount).count }}
            </span>
          </span>
        </template>

        <!-- Not Accessible Count Column -->
        <template #cell(not_accessible)="data">
          <span v-for="(item, i) in data.item.finding_statuses_count" :key="i">
            <span v-if="(item as StatusCount).status == 'NOT_ACCESSIBLE'">
              {{ (item as StatusCount).count }}
            </span>
          </span>
        </template>

        <!-- Not Accessible Count Column -->
        <template #cell(not_analyzed)="data">
          <span v-for="(item, i) in data.item.finding_statuses_count" :key="i">
            <span v-if="(item as StatusCount).status == 'NOT_ANALYZED'">
              {{ (item as StatusCount).count }}
            </span>
          </span>
        </template>

        <!-- Health Bar Column -->
        <template #cell(health)="data">
          <HealthBar
            :truePositive="(data.item as RuleFindingCountModelAugmented).tpCount"
            :falsePositive="(data.item as RuleFindingCountModelAugmented).fpCount"
            :notAnalyzed="(data.item as RuleFindingCountModelAugmented).naCount"
            :notAccessible="(data.item as RuleFindingCountModelAugmented).urCount"
            :clarificationRequired="(data.item as RuleFindingCountModelAugmented).crCount"
            :outdated="(data.item as RuleFindingCountModelAugmented).odCount"
            :totalCount="(data.item as RuleFindingCountModelAugmented).finding_count ?? 0"
          />
        </template>

        <!-- Total Calculation Row-->
        <tr name="bottomRow">
          <td :class="ruleTotalRowClass">Sum</td>
          <td :class="ruleTotalRowClass">Avg:{{ avgTruePosiitveRate }}%</td>
          <td :class="ruleTotalRowClass">{{ truePositiveTotalCount }}</td>
          <td :class="ruleTotalRowClass">{{ falsePositiveTotalCount }}</td>
          <td :class="ruleTotalRowClass">{{ clarificationRequiredTotalCount }}</td>
          <td :class="ruleTotalRowClass">{{ notAccessibleTotalCount }}</td>
          <td :class="ruleTotalRowClass">{{ notAnalyzedTotalCount }}</td>
          <td :class="ruleTotalRowClass">{{ outdatedTotalCount }}</td>
          <td :class="ruleTotalRowClass">{{ totalFindingsCountForAllRules }}</td>
          <td :class="ruleTotalRowClass"></td>
        </tr>
      </BTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import AxiosConfig from '@/configuration/axios-config';
import Config from '@/configuration/config';
import HealthBar from '@/components/Common/HealthBar.vue';
import RulePackFilter from '@/components/Filters/RulePackFilter.vue';
import RulePackService from '@/services/rule-pack-service';
import RuleService from '@/services/rule-service';
import RuleTagsFilter from '@/components/Filters/RuleTagsFilter.vue';
import { useAuthUserStore, type PreviousRouteState } from '@/store/index';
import SpinnerVue from '@/components/Common/SpinnerVue.vue';
import { computed, ref } from 'vue';
import type {
  FindingStatus,
  PaginationType,
  RuleFindingCountModel,
  RulePackRead,
  StatusCount,
  Swr,
} from '@/services/shema-to-types';
import { useRouter } from 'vue-router';
import type { AxiosResponse } from 'axios';
import { type TableItem, type BFormCheckbox, BTable } from 'bootstrap-vue-next';
import CommonUtils from '@/utils/common-utils';

const loadedData = ref(false);

type Stats = {
  tpCount: number;
  fpCount: number;
  naCount: number;
  urCount: number;
  crCount: number;
  odCount: number;
};

function getTruePositiveRate(stat: Stats): number {
  let truePositiveRate = Math.round((stat.tpCount / (stat.tpCount + stat.fpCount)) * 100);
  return truePositiveRate || 0;
}

type RuleFindingCountModelAugmented = RuleFindingCountModel & Stats;

const router = useRouter();
const ruleList = ref([] as RuleFindingCountModelAugmented[]);
const ruleTagsList = ref([] as string[]);
const truePositiveTotalCount = ref(0);
const falsePositiveTotalCount = ref(0);
const clarificationRequiredTotalCount = ref(0);
const notAccessibleTotalCount = ref(0);
const notAnalyzedTotalCount = ref(0);
const outdatedTotalCount = ref(0);
const totalFindingsCountForAllRules = ref(0);
const truePositiveRateList = ref([] as number[]);
const avgTruePosiitveRate = ref('0');
const allRulePackVersions = ref([] as RulePackRead[]);
const selectedRuleTags = ref([] as string[]);
const selectedVersionsList = ref([] as RulePackRead[]);
const selectedVersions = ref([] as string[]);
const ruleTotalRowClass = ref(['text-start', 'fw-bold']);
const includeDeletedRepositories = ref(false);

type FieldType = {
  key: string;
  sortable?: boolean;
  label: string;
  class: string;
  thStyle: { borderTop: string; width?: string };
  tdClass?: string;
};

const fields = ref([
  {
    key: 'rule_name',
    sortable: true,
    label: 'Rule',
    class: 'text-start position-sticky',
    thStyle: { borderTop: '0px' },
  },
  {
    key: 'true_positive_rate',
    sortable: false,
    label: 'True Positive Rate',
    class: 'text-start position-sticky',
    thStyle: { borderTop: '0px' },
  },
  {
    key: 'true_positive',
    sortable: false,
    label: 'True Positive',
    class: 'text-start position-sticky',
    thStyle: { borderTop: '0px' },
  },
  {
    key: 'false_positive',
    sortable: false,
    label: 'False Positive',
    class: 'text-start position-sticky',
    thStyle: { borderTop: '0px' },
  },
  {
    key: 'clarification_required',
    sortable: false,
    label: 'Clarification Required',
    class: 'text-start position-sticky',
    thStyle: { borderTop: '0px' },
  },
  {
    key: 'not_accessible',
    sortable: false,
    label: 'Not Accessible',
    class: 'text-start position-sticky',
    thStyle: { borderTop: '0px' },
  },
  {
    key: 'not_analyzed',
    sortable: false,
    label: 'Not Analyzed',
    class: 'text-start position-sticky',
    thStyle: { borderTop: '0px' },
  },
  {
    key: 'outdated',
    sortable: false,
    label: 'Outdated',
    class: 'text-start position-sticky',
    thStyle: { borderTop: '0px' },
  },
  {
    key: 'finding_count',
    sortable: true,
    label: 'Total Count',
    class: 'text-start position-sticky',
    thStyle: { borderTop: '0px' },
    tdClass: 'fw-bold',
  },
  {
    key: 'health',
    label: 'Findings(%)',
    class: 'text-start position-sticky',
    thStyle: { borderTop: '0px', width: '25%' },
  },
] as FieldType[]);

const hasRecords = computed(() => ruleList.value.length > 0);

function onRuleTagsFilterChange(ruleTags: string[]) {
  selectedRuleTags.value = ruleTags;
  fetchRulesWithFindingStatusCount();
}

function fetchRuleTags() {
  RulePackService.getRuleTagsByRulePackVersions(selectedVersions.value)
    .then((response) => {
      selectedRuleTags.value = [];
      ruleTagsList.value = response.data;
    })
    .catch((error) => {
      AxiosConfig.handleError(error);
    });
}

function fetchRulesWithFindingStatusCount() {
  loadedData.value = false;
  RuleService.getRulesWithFindingStatusCount(
    selectedVersions.value,
    selectedRuleTags.value,
    includeDeletedRepositories.value,
  )
    .then((response: AxiosResponse<RuleFindingCountModel[]>) => {
      getTotalCountRowValuesForRuleMetricsTable(response.data);
      loadedData.value = true;
    })
    .catch((error) => {
      AxiosConfig.handleError(error);
    });
}

function calculateTruePositiveRate(data: any): string {
  let truePositiveCount = 0;
  let falsePositiveCount = 0;
  const item: RuleFindingCountModel = data.item as RuleFindingCountModel;
  if (item.finding_statuses_count === undefined) {
    return 'NAN%';
  }
  item.finding_statuses_count.forEach((findingStatus) => {
    if (findingStatus.status === `${Config.value('truePostiveStatusVal')}`) {
      truePositiveCount = findingStatus.count ?? 0;
    }
    if (findingStatus.status === `${Config.value('falsePositiveStatusVal')}`) {
      falsePositiveCount = findingStatus.count ?? 0;
    }
  });
  let truePositiveRate = Math.round(
    (truePositiveCount / (truePositiveCount + falsePositiveCount)) * 100,
  );
  truePositiveRate = truePositiveRate || 0;
  return `${truePositiveRate}%`;
}

function getTotalCountRowValuesForRuleMetricsTable(ruleListCounts: RuleFindingCountModel[]) {
  totalFindingsCountForAllRules.value = 0;
  truePositiveTotalCount.value = 0;
  falsePositiveTotalCount.value = 0;
  clarificationRequiredTotalCount.value = 0;
  outdatedTotalCount.value = 0;
  notAccessibleTotalCount.value = 0;
  notAnalyzedTotalCount.value = 0;
  notAnalyzedTotalCount.value = 0;
  truePositiveRateList.value = [];
  ruleList.value = [];

  ruleListCounts.forEach((rule: RuleFindingCountModel) => {
    const ruleFindingCountAugmented = getRuleFindingCountAugmented(rule);
    ruleList.value.push(ruleFindingCountAugmented);

    const truePositiveRate = getTruePositiveRate(ruleFindingCountAugmented);
    truePositiveRateList.value.push(truePositiveRate);

    totalFindingsCountForAllRules.value += ruleFindingCountAugmented.finding_count ?? 0;
    truePositiveTotalCount.value += ruleFindingCountAugmented.tpCount;
    falsePositiveTotalCount.value += ruleFindingCountAugmented.fpCount;
    clarificationRequiredTotalCount.value += ruleFindingCountAugmented.crCount;
    outdatedTotalCount.value += ruleFindingCountAugmented.odCount;
    notAccessibleTotalCount.value += ruleFindingCountAugmented.urCount;
    notAnalyzedTotalCount.value += ruleFindingCountAugmented.naCount;
  });

  calculateAverageTruePositiveRatePercentage();
}

function getRuleFindingCountAugmented(rule: RuleFindingCountModel): RuleFindingCountModelAugmented {
  let counts: { [key in FindingStatus]: number } = {
    TRUE_POSITIVE: 0,
    FALSE_POSITIVE: 0,
    CLARIFICATION_REQUIRED: 0,
    OUTDATED: 0,
    NOT_ACCESSIBLE: 0,
    NOT_ANALYZED: 0,
  };
  rule.finding_statuses_count?.forEach((findingStatus) => {
    counts[findingStatus.status] = findingStatus.count ?? 0;
  });

  const ruleFindingCountAugmented: RuleFindingCountModelAugmented = {
    rule_name: rule.rule_name,
    finding_count: rule.finding_count,
    finding_statuses_count: rule.finding_statuses_count,
    tpCount: counts['TRUE_POSITIVE'],
    fpCount: counts['FALSE_POSITIVE'],
    naCount: counts['NOT_ANALYZED'],
    urCount: counts['NOT_ACCESSIBLE'],
    crCount: counts['CLARIFICATION_REQUIRED'],
    odCount: counts['OUTDATED'],
  };

  return ruleFindingCountAugmented;
}

function calculateAverageTruePositiveRatePercentage() {
  if (ruleList.value.length > 0 && truePositiveRateList.value.length > 0) {
    const sumOfTruePositveRates = truePositiveRateList.value.reduce((a, b) => a + b, 0);
    avgTruePosiitveRate.value = `${Math.round(sumOfTruePositveRates / ruleList.value.length)}`;
  }
}

function goToRuleAnalysisPage(recordItem: TableItem) {
  const record = recordItem as RuleFindingCountModelAugmented;
  const store = useAuthUserStore();
  const updateState: PreviousRouteState = {
    ruleName: record.rule_name,
    rulePackVersions: selectedVersionsList.value,
    ruleTags: selectedRuleTags.value,
  };
  store.update_previous_route_state(updateState);
  router.push({ name: 'RuleAnalysis' });
}

function onRulePackVersionChange(rulePackVersions: RulePackRead[]) {
  selectedVersions.value = [];
  selectedVersionsList.value = [];
  if (rulePackVersions) {
    for (const obj of rulePackVersions) {
      selectedVersionsList.value.push(obj);
      selectedVersions.value.push(obj.version);
    }
    // Referesh rule tags dropdown options and reset selected value
    selectedRuleTags.value = [];
    fetchRuleTags();
  }
  fetchRulesWithFindingStatusCount();
}

RulePackService.getRulePackVersions(10000, 0)
  .then((response: AxiosResponse<PaginationType<RulePackRead>>) => {
    selectedVersions.value = [];
    allRulePackVersions.value = [];
    for (const index of response.data.data.keys()) {
      const data: RulePackRead = response.data.data[index];
      if (data.active) {
        selectedVersions.value.push(data.version);
        selectedVersionsList.value.push(data);
      }
      allRulePackVersions.value.push(data);
    }
    allRulePackVersions.value.sort(CommonUtils.compareRulePackRead).reverse();
    fetchRuleTags();
    fetchRulesWithFindingStatusCount();
  })
  .catch((error: Swr) => {
    AxiosConfig.handleError(error);
  });
</script>
