// QQ机器人相关功能

// 初始化QQ机器人
export function initQqBot(config: any) {
  console.log('QQ机器人初始化:', config);
}

// 通知用户申请通过
export async function notifyUserApplicationApproved(contact: string, minecraftId: string, qqGroup: string, downloadUrl: string) {
  console.log('通知用户申请通过:', contact, minecraftId);
}

// 通知用户申请被拒绝
export async function notifyUserApplicationRejected(contact: string, minecraftId: string, reason: string) {
  console.log('通知用户申请被拒绝:', contact, minecraftId, reason);
}

// 通知管理员有新的申请
export async function notifyAdminsNewApplication(minecraftId: string, contact: string, age: number | null) {
  console.log('通知管理员有新的申请:', minecraftId, contact, age);
}
