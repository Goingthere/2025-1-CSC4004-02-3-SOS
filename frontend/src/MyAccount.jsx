import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import axios from 'axios';

const MyAccount = () => {
  const [userInfo, setUserInfo] = useState({
    user_id: '',
    nickname: '',
    email: '',
  });

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

  // 삭제용 비밀번호 입력 상태
  const [deletePassword, setDeletePassword] = useState('');

  const accessToken = localStorage.getItem('access');

  // 공통 모달 상태
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalActionHref, setModalActionHref] = useState(null);

  // 삭제 확인 모달 상태
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const openModal = (title, message, actionHref = null) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalActionHref(actionHref);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalActionHref(null);
  };

  useEffect(() => {
    if (!accessToken) return;

    axios
      .get('/api/user/info', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((response) => {
        const { user_id, nickname, email } = response.data;
        setUserInfo({ user_id, nickname, email });
      })
      .catch((error) => {
        if (error.response && error.response.data && error.response.data.error) {
          openModal('오류', error.response.data.error);
        }
      });
  }, [accessToken]);

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    if (!accessToken) {
      openModal('오류', '로그인 후에 정보 수정이 가능합니다.');
      return;
    }

    try {
      const payload = {
        nickname: userInfo.nickname,
        email: userInfo.email,
      };

      const response = await axios.patch('/api/user/info', payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200 && response.data && response.data.user) {
        const { nickname: updatedNickname, email: updatedEmail } = response.data.user;
        setUserInfo((prev) => ({
          ...prev,
          nickname: updatedNickname,
          email: updatedEmail,
        }));
        openModal('성공', response.data.message || '계정 정보가 성공적으로 저장되었습니다.');
      } else {
        openModal('오류', '계정 정보 저장에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        openModal('오류', error.response.data.error);
      } else if (error.response && error.response.status === 401) {
        openModal('오류', '로그인 후에 정보 수정이 가능합니다.');
      } else {
        openModal('오류', '서버 오류로 인해 저장할 수 없습니다.');
      }
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword) {
      openModal('오류', '현재 비밀번호를 입력해주세요.');
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      openModal('오류', '새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!newPassword || !newPasswordConfirm) {
      openModal('오류', '새 비밀번호와 재입력을 모두 입력해주세요.');
      return;
    }
    if (!accessToken) {
      openModal('오류', '로그인 후에 정보 수정이 가능합니다.');
      return;
    }

    try {
      const payload = {
        current_password: oldPassword,
        password: newPassword,
        password2: newPasswordConfirm,
      };

      const response = await axios.patch('/api/user/info', payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200 && response.data && response.data.message) {
        setOldPassword('');
        setNewPassword('');
        setNewPasswordConfirm('');
        openModal('성공', response.data.message || '비밀번호가 성공적으로 변경되었습니다.');
      } else {
        openModal('오류', '비밀번호 변경에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        openModal('오류', error.response.data.error);
      } else if (error.response && error.response.status === 401) {
        openModal('오류', '로그인 후에 정보 수정이 가능합니다.');
      } else {
        openModal('오류', '서버 오류로 인해 비밀번호를 변경할 수 없습니다.');
      }
    }
  };

  // 실제 탈퇴 요청 함수 (확인 모달 Yes 클릭 시 호출)
  const confirmDeleteAccount = async () => {
    if (!accessToken) {
      openModal('오류', '인증된 사용자만 탈퇴할 수 있습니다.');
      setShowDeleteConfirm(false);
      return;
    }
    if (!deletePassword) {
      openModal('오류', '현재 비밀번호를 입력해주세요.');
      setShowDeleteConfirm(false);
      return;
    }

    try {
      const payload = {
        password: deletePassword,
        chk_password: deletePassword,
      };

      const response = await axios.delete('/api/users/withdraw/', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        data: payload,
      });

      if (response.status === 200) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        openModal('성공', '회원 탈퇴가 완료되었습니다.', '/');
      } else {
        openModal('오류', '회원 탈퇴에 실패했습니다.');
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        openModal('오류', error.response.data.error);
      } else {
        openModal('오류', '서버 오류로 인해 계정을 탈퇴할 수 없습니다.');
      }
    } finally {
      setShowDeleteConfirm(false);
      setDeletePassword('');
    }
  };

  // Delete ID 버튼 클릭 시 확인 모달 열기
  const openDeleteConfirmation = () => {
    setShowDeleteConfirm(true);
  };

  return (
    <>
      <div className="myaccount-title-box">
        <h1 className="myaccount-title">Your Account</h1>
      </div>

      <div className="myaccount-info-box">
        <form onSubmit={handleSaveInfo}>
          <div className="form-group">
            <label htmlFor="nickname">NickName</label>
            <input
              type="text"
              id="nickname"
              className="form-control"
              value={userInfo.nickname}
              onChange={(e) => setUserInfo({ ...userInfo, nickname: e.target.value })}
              placeholder="회원가입할 때 입력했던 Nickname이 표시됩니다."
            />
          </div>

          <div className="form-group">
            <label htmlFor="userid">ID</label>
            <input
              type="text"
              id="userid"
              className="form-control"
              value={userInfo.user_id}
              readOnly
              placeholder="회원가입할 때 입력했던 ID가 표시됩니다."
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="form-control"
              value={userInfo.email}
              onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
              placeholder="회원가입할 때 입력했던 Email이 표시됩니다."
            />
          </div>

          <div className="button-group">
            <button type="submit" className="btn btn-save">
              Save
            </button>
          </div>
        </form>

        <hr />

        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label htmlFor="password-check-old">현재 Password</label>
            <input
              type="password"
              id="password-check-old"
              className="form-control"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="현재 비밀번호를 입력하세요."
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">변경할 Password</label>
            <input
              type="password"
              id="password"
              className="form-control"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="변경할 비밀번호를 입력하세요."
            />
          </div>

          <div className="form-group">
            <label htmlFor="password-check">Password Check</label>
            <input
              type="password"
              id="password-check"
              className="form-control"
              value={newPasswordConfirm}
              onChange={(e) => setNewPasswordConfirm(e.target.value)}
              placeholder="변경할 비밀번호를 다시 입력하세요."
            />
          </div>

          <div className="button-group">
            <button type="submit" className="btn btn-save">
              Change Password
            </button>
            <button type="button" className="btn btn-danger" onClick={openDeleteConfirmation}>
              Delete ID
            </button>
          </div>
        </form>
      </div>

      {/* 회원 탈퇴 확인 모달 */}
      {showDeleteConfirm && (
        <div
          className="modal fade show"
          style={{ display: 'block' }}
          tabIndex="-1"
          aria-labelledby="deleteConfirmLabel"
          aria-hidden="false"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h1 className="modal-title fs-5" id="deleteConfirmLabel">
                  회원 탈퇴
                </h1>
                <button type="button" className="btn-close" onClick={() => setShowDeleteConfirm(false)}></button>
              </div>
              <div className="modal-body">
                <p>정말로 계정을 삭제하시겠습니까?</p>
                <input
                  type="password"
                  className="form-control"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="현재 비밀번호를 입력해주세요."
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-danger" onClick={confirmDeleteAccount}>
                  Yes
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                  No
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </div>
      )}

      {/* 공통 모달 (결과 알림용) */}
      <div
        className={`modal fade${showModal ? ' show' : ''}`}
        id="commonModal"
        tabIndex="-1"
        aria-labelledby="commonModalLabel"
        aria-hidden={!showModal}
        style={{ display: showModal ? 'block' : 'none' }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="commonModalLabel">
                {modalTitle}
              </h1>
              <button type="button" className="btn-close" onClick={closeModal}></button>
            </div>
            <div className="modal-body">{modalMessage}</div>
            <div className="modal-footer">
              {modalActionHref ? (
                <a href={modalActionHref} className="btn btn-primary">
                  OK
                </a>
              ) : (
                <button type="button" className="btn btn-primary" onClick={closeModal}>
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {showModal && <div className="modal-backdrop fade show"></div>}
    </>
  );
};

export default MyAccount;
