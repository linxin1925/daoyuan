import _ from 'lodash';
import { useDataStore } from '../store';

/**
 * 从当前楼层 stat_data 中删除指定路径下的条目。
 * 同步写入 MVU 楼层变量，并刷新 store 更新 UI。
 *
 * @param statPath 在 stat_data 下的相对路径，如 '人物' / '世界.动向' / '主角.储物袋'
 * @param entryName 要删除的条目键名
 */
export async function deleteStatEntry(statPath: string, entryName: string): Promise<boolean> {
  try {
    const messageId = getCurrentMessageId();
    const mvuData = Mvu.getMvuData({ type: 'message', message_id: messageId });
    const fullPath = 'stat_data.' + statPath + '["' + entryName.replace(/"/g, '\\"') + '"]';

    if (!_.has(mvuData, fullPath)) return false;

    _.unset(mvuData, fullPath);
    await Mvu.replaceMvuData(mvuData, { type: 'message', message_id: messageId });
    // replaceMvuData 不会触发 VARIABLE_UPDATE_ENDED 事件，需手动刷新 store
    useDataStore().refresh();
    return true;
  } catch (e) {
    console.warn('[deleteStatEntry] 删除失败', statPath, entryName, e);
    return false;
  }
}
