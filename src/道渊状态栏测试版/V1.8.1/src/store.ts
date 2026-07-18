import { defineStore } from 'pinia';
import { ref } from 'vue';
import _ from 'lodash';

/**
 * 《道渊》v5.1 的 MVU 状态栏 store。
 *
 * 该卡 `schema` 字段是占位字符串 `"没有用别管这个"`，没有 zod schema，
 * 因此**不能**使用 `defineMvuDataStore`（它要求传入 z.ZodObject）。
 *
 * 这里改为：
 * 1. 通过 `Mvu.getMvuData` 一次性拉取楼层 MVU 数据；
 * 2. 监听 `Mvu.events.VARIABLE_UPDATE_ENDED` 刷新本地副本；
 * 3. 暴露的 `data` 是 deep clone（klona-friendly）后的纯 JS 对象，
 *    Vue 模板里可直接当 reactive 用，但禁止直接改后写回（需要写回时用 `Mvu.setMvuVariable`/`Mvu.replaceMvuData`）。
 */

// stat_data 子结构类型（按 MVU变量结构.md 中观察到的字段约定）
export interface 世界 {
  当前时间: string;
  当前地点: string;
  危机程度: string;
  遭遇冷却?: number;
  动向: Record<string, { 阶段?: string; 类型: string; 地点: string; 描述: string }>;
}

export interface 气运详情 {
  类型: string;
  效果: string;
  使用状态: string;
  剩余次数: string | number;
  压制状态: string;
}

export interface 技能子面板 {
  阶级: string;
  熟练度: number;
  成功率: number;
  次数: number;
}

export interface 功法详情 {
  类型: string;
  境界: string;
  熟练度: number;
  描述: string;
}

export interface 主角 {
  姓名?: string;
  性别?: string;
  容貌?: string;
  身形?: string;
  衣着?: string;
  境界: string;
  宗门: string;
  宗门贡献: number;
  所在界: string;
  生命: number;
  精血: number;
  灵力: number;
  修为: number;
  神识: number;
  道心: number;
  神念: string;
  灵根: string;
  状态: string;
  气运: Record<string, 气运详情>;
  炼丹: 技能子面板;
  炼器: 技能子面板;
  储物袋: Record<string, unknown>;
  功法: Record<string, 功法详情>;
  器物: Record<string, unknown>;
}

export interface NPC {
  性别?: string;
  头衔: string;
  境界: string;
  好感: number;
  关系阶段: string;
  生命: number;
  灵力: number;
  修为: number;
  道心: number;
  性格: string;
  描述: string;
}

export interface 机遇条目 {
  难度: string;
  目标: string;
  机缘: string;
  引言: string;
}

export interface 绝色榜条目 {
  排名: string;
  头衔: string;
  仙姿: string;
  群芳谱: string;
}

export interface StatData {
  世界: 世界;
  主角: 主角;
  道侣: Record<string, unknown>;
  灵宠: Record<string, unknown>;
  人物: Record<string, NPC>;
  机遇: Record<string, 机遇条目>;
  绝色榜: Record<string, 绝色榜条目>;
  玉简: Record<string, unknown>;
  $器灵台词: string[];
}

export const useDataStore = defineStore('daoyuan', () => {
  const messageId = getCurrentMessageId();
  const data = ref<StatData | null>(null);
  const lastUpdated = ref<number>(Date.now());

  /** 本楼层变量更新状态：success=vs上一层AI有变化, failed=无变化(没更新), idle=无上一层对比基准 */
  const updateStatus = ref<'success' | 'failed' | 'idle'>('idle');

  /** 三个强制更新项的单独对比：true=已更新, false=和上一层相同(未更新), null=无对比基准 */
  const mandatoryUpdates = ref<{ 动向: boolean | null; 绝色榜: boolean | null; 器灵台词: boolean | null }>({
    动向: null,
    绝色榜: null,
    器灵台词: null,
  });

  function refresh() {
    const mvuData = Mvu.getMvuData({ type: 'message', message_id: messageId });
    const stat = _.get(mvuData, 'stat_data');
    if (stat) {
      data.value = _.cloneDeep(stat) as StatData;
      lastUpdated.value = Date.now();
    }
  }

  /** 对比本楼层与上一层 AI 楼层(N-2)的 stat_data 判断整体和强制项更新状态 */
  function checkUpdateStatus() {
    try {
      const prevId = Number(messageId) - 2;
      if (!Number.isFinite(prevId) || prevId < 0) {
        updateStatus.value = 'idle';
        mandatoryUpdates.value = { 动向: null, 绝色榜: null, 器灵台词: null };
        return;
      }
      const cur = _.get(Mvu.getMvuData({ type: 'message', message_id: messageId }), 'stat_data');
      const prev = _.get(Mvu.getMvuData({ type: 'message', message_id: String(prevId) }), 'stat_data');
      if (!cur || !prev) {
        updateStatus.value = 'idle';
        mandatoryUpdates.value = { 动向: null, 绝色榜: null, 器灵台词: null };
        return;
      }
      updateStatus.value = _.isEqual(cur, prev) ? 'failed' : 'success';
      mandatoryUpdates.value = {
        动向: !_.isEqual(_.get(cur, '世界.动向'), _.get(prev, '世界.动向')),
        绝色榜: !_.isEqual(_.get(cur, '绝色榜'), _.get(prev, '绝色榜')),
        器灵台词: !_.isEqual(_.get(cur, '$器灵台词'), _.get(prev, '$器灵台词')),
      };
    } catch { /* ignore */ }
  }

  refresh();
  checkUpdateStatus();

  eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, () => {
    refresh();
    checkUpdateStatus();
  });

  return { data, lastUpdated, updateStatus, mandatoryUpdates, refresh };
});
