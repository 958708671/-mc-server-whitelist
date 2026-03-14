'use client';

import { useState, useEffect } from 'react';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

interface Admin {
  id: number;
  username: string;
  display_name: string;
  qq: string;
  is_owner: boolean;
  permissions: Permissions;
  show_in_contact: boolean;
  show_in_logs: boolean;
  receive_complaint_email: boolean;
  receive_application_email: boolean;
  receive_qq_notifications: boolean;
  created_at: string;
}

interface Permissions {
  whitelist_review: boolean;
  complaint_handle: boolean;
  blacklist_manage: boolean;
  announcement_manage: boolean;
  event_manage: boolean;
  statistics_view: boolean;
  settings_view: boolean;
  website_edit: boolean;
  admin_manage: boolean;
  logs_view: boolean;
  monitor_view: boolean;
}

const defaultPermissions: Permissions = {
  whitelist_review: true,
  complaint_handle: true,
  blacklist_manage: true,
  announcement_manage: true,
  event_manage: true,
  statistics_view: true,
  settings_view: false,
  website_edit: false,
  admin_manage: false,
  logs_view: false,
  monitor_view: false
};

const permissionLabels: Record<keyof Permissions, string> = {
  whitelist_review: '白名单审核',
  complaint_handle: '投诉处理',
  blacklist_manage: '黑名单管理',
  announcement_manage: '公告管理',
  event_manage: '活动管理',
  statistics_view: '数据统计',
  settings_view: '系统设置',
  website_edit: '官网编辑',
  admin_manage: '管理员管理',
  logs_view: '日志查看',
  monitor_view: '监控查看'
};

const permissionCategories = [
  {
    name: '👥 用户管理',
    permissions: ['whitelist_review', 'blacklist_manage'] as const
  },
  {
    name: '📝 内容管理',
    permissions: ['announcement_manage', 'event_manage', 'website_edit'] as const
  },
  {
    name: '🔧 系统管理',
    permissions: ['settings_view', 'admin_manage', 'logs_view', 'monitor_view'] as const
  },
  {
    name: '🚨 投诉处理',
    permissions: ['complaint_handle'] as const
  },
  {
    name: '📊 数据统计',
    permissions: ['statistics_view'] as const
  }
];

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [permissionAdmin, setPermissionAdmin] = useState<Admin | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    display_name: '',
    qq: '',
    is_owner: false,
    permissions: { ...defaultPermissions },
    show_in_contact: true,
    show_in_logs: true,
    receive_complaint_email: false,
    receive_application_email: false,
    receive_qq_notifications: true
  });
  const [saving, setSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [processing, setProcessing] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [deleteUsername, setDeleteUsername] = useState<string>('');
  const [isBatchDelete, setIsBatchDelete] = useState(false);
  const [showBatchPermissionModal, setShowBatchPermissionModal] = useState(false);
  const [batchPermissions, setBatchPermissions] = useState<Partial<Permissions>>({});
  const [batchReceiveComplaintEmail, setBatchReceiveComplaintEmail] = useState<boolean | null>(null);
  const [batchReceiveApplicationEmail, setBatchReceiveApplicationEmail] = useState<boolean | null>(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/list');
      const result = await response.json();
      if (result.success) {
        setAdmins(result.data);
        setSelectedIds(new Set());
      }
    } catch (error) {
      console.error('获取管理员列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectAll = () => {
    const nonOwnerAdmins = admins.filter(a => !a.is_owner);
    if (selectedIds.size === nonOwnerAdmins.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(nonOwnerAdmins.map(a => a.id)));
    }
  };

  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) {
      alert('请先选择要删除的管理员');
      return;
    }
    setIsBatchDelete(true);
    setDeleteTarget(null);
    setDeleteUsername('');
    setDeleteModalOpen(true);
  };

  const handleSingleDelete = (id: number, username: string) => {
    setDeleteTarget(id);
    setDeleteUsername(username);
    setIsBatchDelete(false);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    setDeleteModalOpen(false);
    setProcessing(true);
    try {
      if (isBatchDelete) {
        for (const id of selectedIds) {
          await fetch(`/api/admin/manage?id=${id}`, { method: 'DELETE' });
        }
        alert('批量删除成功');
      } else if (deleteTarget) {
        const response = await fetch(`/api/admin/manage?id=${deleteTarget}`, { method: 'DELETE' });
        const result = await response.json();
        if (result.success) {
          alert('删除成功');
        } else {
          alert(result.message || '删除失败');
        }
      }
      fetchAdmins();
    } catch (error) {
      alert('删除失败，请重试');
    } finally {
      setProcessing(false);
      setDeleteTarget(null);
      setDeleteUsername('');
    }
  };

  const handleExport = () => {
    const exportData = selectedIds.size > 0 
      ? admins.filter(a => selectedIds.has(a.id))
      : admins;
    
    if (exportData.length === 0) {
      alert('没有可导出的数据');
      return;
    }
    
    const csvContent = [
      ['ID', '用户名', '昵称', 'QQ', '角色', '展示设置', '创建时间'].join(','),
      ...exportData.map(a => [
        a.id,
        a.username,
        a.display_name || '-',
        a.qq || '-',
        a.is_owner ? '服主' : '管理员',
        `联系页面:${a.show_in_contact ? '是' : '否'}/日志:${a.show_in_logs ? '是' : '否'}`,
        formatDate(a.created_at)
      ].map(field => `"${field}"`).join(','))
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `管理员列表_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.csv`;
    link.click();
  };

  const handleAdd = async () => {
    if (!formData.username || !formData.password) {
      alert('请填写用户名和密码');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/admin/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (result.success) {
        setShowAddModal(false);
        resetForm();
        fetchAdmins();
      } else {
        alert(result.message || '添加失败');
      }
    } catch (error) {
      alert('添加失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingAdmin) return;

    setSaving(true);
    try {
      const response = await fetch('/api/admin/manage', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingAdmin.id,
          username: formData.username,
          password: formData.password || undefined,
          display_name: formData.display_name,
          qq: formData.qq,
          show_in_contact: formData.show_in_contact,
          show_in_logs: formData.show_in_logs,
          receive_complaint_email: formData.receive_complaint_email,
          receive_application_email: formData.receive_application_email
        })
      });
      const result = await response.json();
      if (result.success) {
        setEditingAdmin(null);
        resetForm();
        fetchAdmins();
      } else {
        alert(result.message || '更新失败');
      }
    } catch (error) {
      alert('更新失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePermissions = async () => {
    if (!permissionAdmin) return;

    setSaving(true);
    try {
      const response = await fetch('/api/admin/manage', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: permissionAdmin.id,
          permissions: permissionAdmin.permissions,
          receive_complaint_email: permissionAdmin.receive_complaint_email,
          receive_application_email: permissionAdmin.receive_application_email,
          receive_qq_notifications: permissionAdmin.receive_qq_notifications
        })
      });
      const result = await response.json();
      if (result.success) {
        setShowPermissionModal(false);
        setPermissionAdmin(null);
        fetchAdmins();
      } else {
        alert(result.message || '更新失败');
      }
    } catch (error) {
      alert('更新失败，请重试');
    } finally {
      setSaving(false);
    }
  };



  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      display_name: '',
      qq: '',
      is_owner: false,
      permissions: { ...defaultPermissions },
      show_in_contact: true,
      show_in_logs: true,
      receive_complaint_email: false,
      receive_qq_notifications: false,
      receive_application_email: false
    });
  };

  const openEditModal = (admin: Admin) => {
    setEditingAdmin(admin);
    setFormData({
      username: admin.username,
      password: '',
      display_name: admin.display_name,
      qq: admin.qq,
      is_owner: admin.is_owner,
      permissions: admin.permissions || { ...defaultPermissions },
      show_in_contact: admin.show_in_contact,
      show_in_logs: admin.show_in_logs,
      receive_complaint_email: admin.receive_complaint_email,
      receive_qq_notifications: admin.receive_qq_notifications,
      receive_application_email: admin.receive_application_email
    });
  };

  const openPermissionModal = (admin: Admin) => {
    setPermissionAdmin({
      ...admin,
      permissions: admin.permissions || { ...defaultPermissions }
    });
    setShowPermissionModal(true);
  };

  const togglePermission = (key: keyof Permissions) => {
    if (!permissionAdmin) return;
    setPermissionAdmin({
      ...permissionAdmin,
      permissions: {
        ...permissionAdmin.permissions,
        [key]: !permissionAdmin.permissions[key]
      }
    });
  };

  const openBatchPermissionModal = () => {
    setBatchPermissions({});
    setBatchReceiveComplaintEmail(null);
    setBatchReceiveApplicationEmail(null);
    setShowBatchPermissionModal(true);
  };

  const toggleBatchPermission = (key: keyof Permissions) => {
    setBatchPermissions(prev => ({
      ...prev,
      [key]: prev[key] === undefined ? true : (prev[key] === true ? false : undefined)
    }));
  };

  const handleBatchUpdatePermissions = async () => {
    if (selectedIds.size === 0) {
      alert('请先选择要修改权限的管理员');
      return;
    }

    setProcessing(true);
    try {
      for (const id of selectedIds) {
        const admin = admins.find(a => a.id === id);
        if (!admin) continue;

        const updateData: any = { id };
        
        if (Object.keys(batchPermissions).length > 0) {
          const newPermissions = { ...admin.permissions };
          for (const [key, value] of Object.entries(batchPermissions)) {
            if (value !== undefined) {
              newPermissions[key as keyof Permissions] = value;
            }
          }
          updateData.permissions = newPermissions;
        }
        
        if (batchReceiveComplaintEmail !== null) {
          updateData.receive_complaint_email = batchReceiveComplaintEmail;
        }
        
        if (batchReceiveApplicationEmail !== null) {
          updateData.receive_application_email = batchReceiveApplicationEmail;
        }

        await fetch('/api/admin/manage', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        });
      }
      
      alert('批量修改权限成功');
      setShowBatchPermissionModal(false);
      fetchAdmins();
    } catch (error) {
      alert('批量修改权限失败，请重试');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour12: false
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>👥</span> 管理员管理
          </h1>
          <p className="text-gray-400 text-sm mt-1">添加、编辑和删除管理员账号，配置权限</p>
        </div>
        
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-all flex items-center gap-2"
        >
          <span>➕</span> 添加管理员
        </button>
      </div>

      {admins.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleExport}
            className="px-4 py-2 rounded-lg font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center gap-2"
          >
            📥 {selectedIds.size > 0 ? `导出选中 (${selectedIds.size})` : '导出全部'}
          </button>
          <button
            onClick={openBatchPermissionModal}
            disabled={selectedIds.size === 0 || processing}
            className="px-4 py-2 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all flex items-center gap-2"
          >
            🔐 批量权限 {selectedIds.size > 0 && `(${selectedIds.size})`}
          </button>
          <button
            onClick={handleBatchDelete}
            disabled={selectedIds.size === 0 || processing}
            className="px-4 py-2 rounded-lg font-medium bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all flex items-center gap-2"
          >
            🗑️ 选中删除 {selectedIds.size > 0 && `(${selectedIds.size})`}
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-4xl animate-bounce">👥</div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
          <table className="w-full">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === admins.filter(a => !a.is_owner).length && admins.filter(a => !a.is_owner).length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-500"
                  />
                </th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">ID</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">用户名</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">昵称</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">QQ</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">角色</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3">
                    {!admin.is_owner && (
                      <input
                        type="checkbox"
                        checked={selectedIds.has(admin.id)}
                        onChange={() => toggleSelect(admin.id)}
                        className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-500"
                      />
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-300 font-medium">{admin.username}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                        admin.is_owner ? 'bg-yellow-500/20' : 'bg-blue-500/20'
                      }`}>
                        {admin.is_owner ? '👑' : '👤'}
                      </span>
                      <span className="text-white font-medium">{admin.username}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{admin.display_name || '-'}</td>
                  <td className="px-4 py-3 text-gray-300">{admin.qq || '-'}</td>
                  <td className="px-4 py-3">
                    {admin.is_owner ? (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">服主</span>
                    ) : (
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">管理员</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => openEditModal(admin)}
                        className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-all text-sm"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => openPermissionModal(admin)}
                        className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-all text-sm"
                      >
                        权限
                      </button>
                      {!admin.is_owner && (
                        <button
                          onClick={() => handleSingleDelete(admin.id, admin.username)}
                          className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all text-sm"
                        >
                          删除
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 添加/编辑管理员弹窗 */}
      {(showAddModal || editingAdmin) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 border-2 border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>{editingAdmin ? '✏️' : '➕'}</span> {editingAdmin ? '编辑管理员' : '添加管理员'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingAdmin(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2 font-medium">用户名 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="登录用户名"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm mb-2 font-medium">
                  密码 {editingAdmin && '(留空不修改)'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="登录密码"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm mb-2 font-medium">显示昵称</label>
                <input
                  type="text"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  placeholder="显示名称（可选）"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm mb-2 font-medium">QQ号</label>
                <input
                  type="text"
                  value={formData.qq}
                  onChange={(e) => setFormData({ ...formData, qq: e.target.value })}
                  placeholder="联系QQ（可选）"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
                />
              </div>

              {/* 展示设置 */}
              <div className="border-t border-gray-700 pt-4">
                <label className="block text-gray-300 text-sm mb-3 font-medium">展示设置</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="show_in_contact"
                      checked={formData.show_in_contact}
                      onChange={(e) => setFormData({ ...formData, show_in_contact: e.target.checked })}
                      className="w-5 h-5 rounded bg-gray-900 border-gray-700"
                    />
                    <label htmlFor="show_in_contact" className="text-gray-300 text-sm">在联系页面显示</label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="show_in_logs"
                      checked={formData.show_in_logs}
                      onChange={(e) => setFormData({ ...formData, show_in_logs: e.target.checked })}
                      className="w-5 h-5 rounded bg-gray-900 border-gray-700"
                    />
                    <label htmlFor="show_in_logs" className="text-gray-300 text-sm">在操作日志中显示</label>
                  </div>
                </div>
              </div>
              
              {!editingAdmin && (
                <div className="flex items-center gap-3 border-t border-gray-700 pt-4">
                  <input
                    type="checkbox"
                    id="is_owner"
                    checked={formData.is_owner}
                    onChange={(e) => setFormData({ ...formData, is_owner: e.target.checked })}
                    className="w-5 h-5 rounded bg-gray-900 border-gray-700"
                  />
                  <label htmlFor="is_owner" className="text-gray-300">👑 设为服主（拥有所有权限）</label>
                </div>
              )}
              {editingAdmin && editingAdmin.is_owner && (
                <div className="flex items-center gap-3 border-t border-gray-700 pt-4">
                  <div className="w-5 h-5 rounded bg-gray-900 border-gray-700 flex items-center justify-center">
                    <span className="text-sm text-white">✓</span>
                  </div>
                  <label className="text-gray-300">👑 服主（拥有所有权限）</label>
                </div>
              )}

              {/* 权限配置（仅在添加时显示，编辑在单独弹窗） */}
              {!editingAdmin && !formData.is_owner && (
                <div className="border-t border-gray-700 pt-4">
                  <label className="block text-gray-300 text-sm mb-3 font-medium">权限配置</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(permissionLabels).map(([key, label]) => (
                      <div key={key} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`perm_${key}`}
                          checked={formData.permissions[key as keyof Permissions]}
                          onChange={(e) => setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              [key]: e.target.checked
                            }
                          })}
                          className="w-4 h-4 rounded bg-gray-900 border-gray-700"
                        />
                        <label htmlFor={`perm_${key}`} className="text-gray-400 text-xs">{label}</label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingAdmin(null);
                  resetForm();
                }}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all"
              >
                取消
              </button>
              <button
                onClick={editingAdmin ? handleUpdate : handleAdd}
                disabled={saving}
                className="flex-1 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl transition-all disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 权限配置弹窗 */}
      {showPermissionModal && permissionAdmin && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 border-2 border-gray-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>🔐</span> 配置权限 - {permissionAdmin.display_name || permissionAdmin.username}
              </h2>
              <button
                onClick={async () => {
                  // 检查所有管理员权限
                  const allAdmins = await fetch('/api/admin/list').then(res => res.json());
                  if (allAdmins.success) {
                    const adminsWithPermission = allAdmins.data.filter((admin: Admin) => 
                      admin.permissions && admin.permissions.whitelist_review
                    );
                    
                    if (adminsWithPermission.length === 0) {
                      alert('警告：没有管理员拥有白名单审核权限！请至少为一个管理员开启此权限。');
                    }
                  }
                  
                  setShowPermissionModal(false);
                  setPermissionAdmin(null);
                }}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-5">
              {permissionCategories.map((category) => (
                <div key={category.name} className="bg-gray-800/30 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    {category.name}
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {category.permissions.map((key) => (
                      <div key={key} className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3 hover:bg-gray-700/70 transition-colors">
                        <span className="text-gray-300">{permissionLabels[key]}</span>
                        {permissionAdmin.is_owner ? (
                          <button
                            disabled
                            className="px-3 py-1.5 rounded-lg text-sm transition-all font-medium bg-green-600/20 text-green-400 border border-green-600/30 cursor-not-allowed"
                          >
                            ✓ 允许
                          </button>
                        ) : (
                          <button
                            onClick={() => togglePermission(key)}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-all font-medium ${
                              permissionAdmin.permissions[key]
                                ? 'bg-green-600/20 text-green-400 border border-green-600/30 hover:bg-green-600/30'
                                : 'bg-gray-600 text-gray-400 border border-gray-500 hover:bg-gray-500'
                            }`}
                          >
                            {permissionAdmin.permissions[key] ? '✓ 允许' : '✗ 禁止'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="bg-gray-800/30 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  📧 邮件通知设置
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3 hover:bg-gray-700/70 transition-colors">
                    <div>
                      <span className="text-gray-300 block">接收投诉举报邮件</span>
                      <span className="text-gray-500 text-xs">当有新的投诉举报时发送邮件通知</span>
                    </div>
                    <button
                      onClick={() => setPermissionAdmin({
                        ...permissionAdmin,
                        receive_complaint_email: !permissionAdmin.receive_complaint_email
                      })}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all font-medium ${
                        permissionAdmin.receive_complaint_email
                          ? 'bg-green-600/20 text-green-400 border border-green-600/30 hover:bg-green-600/30'
                          : 'bg-gray-600 text-gray-400 border border-gray-500 hover:bg-gray-500'
                      }`}
                    >
                      {permissionAdmin.receive_complaint_email ? '✓ 开启' : '✗ 关闭'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3 hover:bg-gray-700/70 transition-colors">
                    <div>
                      <span className="text-gray-300 block">接收白名单申请邮件</span>
                      <span className="text-gray-500 text-xs">当有新的白名单申请时发送邮件通知</span>
                    </div>
                    <button
                      onClick={() => setPermissionAdmin({
                        ...permissionAdmin,
                        receive_application_email: !permissionAdmin.receive_application_email
                      })}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all font-medium ${
                        permissionAdmin.receive_application_email
                          ? 'bg-green-600/20 text-green-400 border border-green-600/30 hover:bg-green-600/30'
                          : 'bg-gray-600 text-gray-400 border border-gray-500 hover:bg-gray-500'
                      }`}
                    >
                      {permissionAdmin.receive_application_email ? '✓ 开启' : '✗ 关闭'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3 hover:bg-gray-700/70 transition-colors">
                    <div>
                      <span className="text-gray-300 block">接收QQ机器人通知</span>
                      <span className="text-gray-500 text-xs">当有新的白名单申请时发送QQ通知</span>
                      <span className="text-yellow-400 text-xs mt-1 block">预计未来上线</span>
                    </div>
                    <button
                      disabled
                      className="px-3 py-1.5 rounded-lg text-sm transition-all font-medium bg-gray-600 text-gray-400 border border-gray-500 cursor-not-allowed"
                    >
                      未开放
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={async () => {
                  // 检查所有管理员权限
                  const allAdmins = await fetch('/api/admin/list').then(res => res.json());
                  if (allAdmins.success) {
                    const adminsWithPermission = allAdmins.data.filter((admin: Admin) => 
                      admin.permissions && admin.permissions.whitelist_review
                    );
                    
                    if (adminsWithPermission.length === 0) {
                      alert('警告：没有管理员拥有白名单审核权限！请至少为一个管理员开启此权限。');
                    }
                  }
                  
                  setShowPermissionModal(false);
                  setPermissionAdmin(null);
                }}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all"
              >
                取消
              </button>
              <button
                onClick={async () => {
                  await handleUpdatePermissions();
                  
                  // 检查所有管理员权限
                  const allAdmins = await fetch('/api/admin/list').then(res => res.json());
                  if (allAdmins.success) {
                    const adminsWithPermission = allAdmins.data.filter((admin: Admin) => 
                      admin.permissions && admin.permissions.whitelist_review
                    );
                    
                    if (adminsWithPermission.length === 0) {
                      alert('警告：没有管理员拥有白名单审核权限！请至少为一个管理员开启此权限。');
                    }
                  }
                }}
                disabled={saving}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存权限'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 批量权限修改弹窗 */}
      {showBatchPermissionModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 border-2 border-gray-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>🔐</span> 批量配置权限 ({selectedIds.size} 个管理员)
              </h2>
              <button
                onClick={() => {
                  setShowBatchPermissionModal(false);
                }}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            <p className="text-gray-400 text-sm mb-4">
              提示：点击权限按钮可切换三种状态：不修改 → 允许 → 禁止
            </p>
            
            <div className="space-y-5">
              {permissionCategories.map((category) => (
                <div key={category.name} className="bg-gray-800/30 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    {category.name}
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {category.permissions.map((key) => {
                      const state = batchPermissions[key];
                      let buttonClass = 'bg-gray-600 text-gray-400 border border-gray-500 hover:bg-gray-500';
                      let buttonText = '━ 不修改';
                      
                      if (state === true) {
                        buttonClass = 'bg-green-600/20 text-green-400 border border-green-600/30 hover:bg-green-600/30';
                        buttonText = '✓ 允许';
                      } else if (state === false) {
                        buttonClass = 'bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30';
                        buttonText = '✗ 禁止';
                      }
                      
                      return (
                        <div key={key} className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3 hover:bg-gray-700/70 transition-colors">
                          <span className="text-gray-300">{permissionLabels[key]}</span>
                          <button
                            onClick={() => toggleBatchPermission(key)}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-all font-medium ${buttonClass}`}
                          >
                            {buttonText}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="bg-gray-800/30 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  📧 邮件通知设置
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3 hover:bg-gray-700/70 transition-colors">
                    <div>
                      <span className="text-gray-300 block">接收投诉举报邮件</span>
                      <span className="text-gray-500 text-xs">当有新的投诉举报时发送邮件通知</span>
                    </div>
                    <button
                      onClick={() => setBatchReceiveComplaintEmail(
                        batchReceiveComplaintEmail === null ? true : (batchReceiveComplaintEmail === true ? false : null)
                      )}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all font-medium ${
                        batchReceiveComplaintEmail === null
                          ? 'bg-gray-600 text-gray-400 border border-gray-500 hover:bg-gray-500'
                          : batchReceiveComplaintEmail
                          ? 'bg-green-600/20 text-green-400 border border-green-600/30 hover:bg-green-600/30'
                          : 'bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30'
                      }`}
                    >
                      {batchReceiveComplaintEmail === null ? '━ 不修改' : (batchReceiveComplaintEmail ? '✓ 开启' : '✗ 关闭')}
                    </button>
                  </div>
                  <div className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3 hover:bg-gray-700/70 transition-colors">
                    <div>
                      <span className="text-gray-300 block">接收白名单申请邮件</span>
                      <span className="text-gray-500 text-xs">当有新的白名单申请时发送邮件通知</span>
                    </div>
                    <button
                      onClick={() => setBatchReceiveApplicationEmail(
                        batchReceiveApplicationEmail === null ? true : (batchReceiveApplicationEmail === true ? false : null)
                      )}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all font-medium ${
                        batchReceiveApplicationEmail === null
                          ? 'bg-gray-600 text-gray-400 border border-gray-500 hover:bg-gray-500'
                          : batchReceiveApplicationEmail
                          ? 'bg-green-600/20 text-green-400 border border-green-600/30 hover:bg-green-600/30'
                          : 'bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30'
                      }`}
                    >
                      {batchReceiveApplicationEmail === null ? '━ 不修改' : (batchReceiveApplicationEmail ? '✓ 开启' : '✗ 关闭')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowBatchPermissionModal(false);
                }}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all"
              >
                取消
              </button>
              <button
                onClick={handleBatchUpdatePermissions}
                disabled={processing}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all disabled:opacity-50"
              >
                {processing ? '保存中...' : '保存权限'}
              </button>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteTarget(null);
          setDeleteUsername('');
        }}
        onConfirm={confirmDelete}
        title={isBatchDelete ? '批量删除管理员' : '删除管理员'}
        message={isBatchDelete 
          ? `确定要删除选中的 ${selectedIds.size} 个管理员吗？` 
          : `确定要删除管理员 "${deleteUsername}" 吗？`
        }
        count={isBatchDelete ? selectedIds.size : 1}
        itemName="个管理员"
        processing={processing}
      />
    </div>
  );
}
