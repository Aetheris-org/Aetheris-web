<template>
  <div class="settings-privacy-container">
    <AppHeader />
    
    <!-- Main Body -->
    <div class="main-body">
      <SettingsSidebar />
      
      <!-- Content -->
      <div class="content">
        <!-- Account Security Section -->
        <div class="security-section">
          <h1 class="section-title">{{ $t('settings.privacy.h1') }}</h1>
          <h2 class="section-subtitle">{{ $t('settings.privacy.subtitle') }}</h2>
          
          <div class="security-options">
            <!-- Email -->
            <div class="security-option">
              <div class="option-info">
                <h1 class="option-title">{{ $t('settings.privacy.h2') }}</h1>
                <h2 class="option-subtitle">{{ $t('settings.privacy.subtitle2') }}</h2>
              </div>
              <button class="option-button" @click="openEmailModal">{{ $t('settings.privacy.buttons.changeEmail') }}</button>
            </div>
            
            <!-- Password -->
            <div class="security-option">
              <div class="option-info">
                <h1 class="option-title">{{ $t('settings.privacy.h3') }}</h1>
                <h2 class="option-subtitle">{{ $t('settings.privacy.subtitle3') }}</h2>
              </div>
              <button class="option-button" @click="openPasswordModal">{{ $t('settings.privacy.buttons.changePassword') }}</button>
            </div>
            
            <!-- 2FA -->
            <div class="security-option">
              <div class="option-info">
                <h1 class="option-title">{{ $t('settings.privacy.h4') }}</h1>
                <h2 class="option-subtitle">{{ $t('settings.privacy.subtitle4') }}</h2>
              </div>
              <button class="option-button" @click="open2FAModal">{{ $t('settings.privacy.buttons.add2FA') }}</button>
            </div>
            
            <!-- Download Data -->
            <div class="security-option">
              <div class="option-info">
                <h1 class="option-title">{{ $t('settings.privacy.h5') }}</h1>
                <h2 class="option-subtitle">{{ $t('settings.privacy.subtitle5') }}</h2>
              </div>
              <button class="option-button" @click="downloadData">{{ $t('settings.privacy.buttons.downloadData') }}</button>
            </div>
          </div>
        </div>
        
        <!-- Data Management Section -->
        <div class="data-section">
          <h1 class="section-title">{{ $t('settings.privacy.h6') }}</h1>
          <h2 class="section-subtitle">{{ $t('settings.privacy.subtitle6') }}</h2>
          
          <div class="data-options">
            <!-- Delete Account -->
            <div class="data-option">
              <div class="option-info">
                <h1 class="option-title danger">{{ $t('settings.privacy.h7') }}</h1>
                <h2 class="option-subtitle">{{ $t('settings.privacy.subtitle7') }}</h2>
              </div>
              <button class="option-button danger" @click="openDeleteAccountModal">{{ $t('settings.privacy.buttons.deleteAccount') }}</button>
            </div>
            
            <!-- Hide Profile -->
            <div class="data-option">
              <div class="option-info">
                <h1 class="option-title danger">{{ $t('settings.privacy.h8') }}</h1>
                <h2 class="option-subtitle">{{ $t('settings.privacy.subtitle8') }}</h2>
              </div>
              <button class="option-button danger" @click="openHideProfileModal">{{ $t('settings.privacy.buttons.hideProfile') }}</button>
            </div>
            
            <!-- Extra Lock -->
            <div class="data-option">
              <div class="option-info">
                <h1 class="option-title danger">{{ $t('settings.privacy.h9') }}</h1>
                <h2 class="option-subtitle">{{ $t('settings.privacy.subtitle9') }}</h2>
              </div>
              <button class="option-button danger" @click="openExtraLockModal">{{ $t('settings.privacy.buttons.lockProfile') }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <AppFooter />
    
    <!-- Email Change Modal -->
    <div v-if="isEmailModalOpen" class="modal-overlay" @click="closeEmailModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h1 class="modal-title">{{ $t('settings.privacy.panels.email.title') }}</h1>
          <button class="modal-close" @click="closeEmailModal">×</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">{{ $t('settings.privacy.panels.email.h1') }}</label>
            <input 
              type="email" 
              class="form-input" 
              :class="{ 'error': currentEmailError }"
              v-model="currentEmail"
              :placeholder="$t('settings.privacy.panels.email.input1')"
            />
            <p v-if="currentEmailError" class="error-message">{{ currentEmailError }}</p>
          </div>
          
          <div class="form-group">
            <label class="form-label">{{ $t('settings.privacy.panels.email.h2') }}</label>
            <input 
              type="email" 
              class="form-input" 
              :class="{ 'error': newEmailError }"
              v-model="newEmail"
              :placeholder="$t('settings.privacy.panels.email.input2')"
            />
            <p v-if="newEmailError" class="error-message">{{ newEmailError }}</p>
          </div>
          
          <div class="form-group">
            <label class="form-label">{{ $t('settings.privacy.panels.email.h3') }}</label>
            <input 
              type="password" 
              class="form-input" 
              :class="{ 'error': passwordError }"
              v-model="emailPassword"
              :placeholder="$t('settings.privacy.panels.email.input3')"
            />
            <p v-if="passwordError" class="error-message">{{ passwordError }}</p>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="modal-button secondary" @click="closeEmailModal">{{ $t('settings.privacy.panels.email.button1') }}</button>
          <button class="modal-button primary" @click="changeEmail" :disabled="!isEmailFormValid">{{ $t('settings.privacy.panels.email.button2') }}</button>
        </div>
      </div>
    </div>
    
    <!-- Password Change Modal -->
    <div v-if="isPasswordModalOpen" class="modal-overlay" @click="closePasswordModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h1 class="modal-title">{{ $t('settings.privacy.panels.password.title') }}</h1>
          <button class="modal-close" @click="closePasswordModal">×</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">{{ $t('settings.privacy.panels.password.h1') }}</label>
            <input 
              type="password" 
              class="form-input" 
              :class="{ 'error': currentPasswordError }"
              v-model="currentPassword"
              :placeholder="$t('settings.privacy.panels.password.input1')"
            />
            <p v-if="currentPasswordError" class="error-message">{{ currentPasswordError }}</p>
          </div>
          
          <div class="form-group">
            <label class="form-label">{{ $t('settings.privacy.panels.password.h2') }}</label>
            <input 
              type="password" 
              class="form-input" 
              :class="{ 'error': newPasswordError }"
              v-model="newPassword"
              :placeholder="$t('settings.privacy.panels.password.input2')"
            />
            <p v-if="newPasswordError" class="error-message">{{ newPasswordError }}</p>
          </div>
          
          <div class="form-group">
            <label class="form-label">{{ $t('settings.privacy.panels.password.h3') }}</label>
            <input 
              type="password" 
              class="form-input" 
              :class="{ 'error': confirmPasswordError }"
              v-model="confirmPassword"
              :placeholder="$t('settings.privacy.panels.password.input3')"
            />
            <p v-if="confirmPasswordError" class="error-message">{{ confirmPasswordError }}</p>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="modal-button secondary" @click="closePasswordModal">{{ $t('settings.privacy.panels.password.button1') }}</button>
          <button class="modal-button primary" @click="changePassword" :disabled="!isPasswordFormValid">{{ $t('settings.privacy.panels.password.button2') }}</button>
        </div>
      </div>
    </div>
    
    <!-- 2FA Setup Modal -->
    <div v-if="is2FAModalOpen" class="modal-overlay" @click="close2FAModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h1 class="modal-title">{{ $t('settings.privacy.panels.2FA.title') }}</h1>
          <button class="modal-close" @click="close2FAModal">×</button>
        </div>
        
        <div class="modal-body">
          <div class="twofa-info">
            <p class="info-text">{{ $t('settings.privacy.panels.2FA.subtitle') }}</p>
            <div class="qr-code-placeholder">
              <div class="qr-code">{{ $t('settings.privacy.panels.2FA.qrCode') }}</div>
            </div>
            <p class="info-text">{{ $t('settings.privacy.panels.2FA.subtitle2') }}</p>
            <div class="manual-code">{{ twoFASecret }}</div>
          </div>
          
          <div class="form-group">
            <label class="form-label">{{ $t('settings.privacy.panels.2FA.h1') }}</label>
            <input 
              type="text" 
              class="form-input" 
              :class="{ 'error': twoFACodeError }"
              v-model="twoFACode"
              :placeholder="$t('settings.privacy.panels.2FA.input2')"
              maxlength="6"
            />
            <p v-if="twoFACodeError" class="error-message">{{ twoFACodeError }}</p>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="modal-button secondary" @click="close2FAModal">{{ $t('settings.privacy.panels.2FA.button1') }}</button>
          <button class="modal-button primary" @click="setup2FA" :disabled="!is2FAFormValid">{{ $t('settings.privacy.panels.2FA.button2') }}</button>
        </div>
      </div>
    </div>
    
    <!-- Delete Account Modal -->
    <div v-if="isDeleteAccountModalOpen" class="modal-overlay" @click="closeDeleteAccountModal">
      <div class="modal-content danger-modal" @click.stop>
        <div class="modal-header">
          <h1 class="modal-title danger">{{ $t('settings.privacy.panels.deleteAccount.title') }}</h1>
          <button class="modal-close" @click="closeDeleteAccountModal">×</button>
        </div>
        
        <div class="modal-body">
          <div class="warning-section">
            <p class="warning-text">{{ $t('settings.privacy.panels.deleteAccount.subtitle') }}</p>
            <p class="warning-description">{{ $t('settings.privacy.panels.deleteAccount.subtitle') }}</p>
          </div>
          
          <div class="form-group">
            <label class="form-label">{{ $t('settings.privacy.panels.deleteAccount.h1') }}</label>
            <input 
              type="text" 
              class="form-input" 
              :class="{ 'error': deleteConfirmError }"
              v-model="deleteConfirm"
              :placeholder="$t('settings.privacy.panels.deleteAccount.input1')"
            />
            <p v-if="deleteConfirmError" class="error-message">{{ deleteConfirmError }}</p>
          </div>
          
          <div class="form-group">
            <label class="form-label">{{ $t('settings.privacy.panels.deleteAccount.h2') }}</label>
            <input 
              type="password" 
              class="form-input" 
              :class="{ 'error': deletePasswordError }"
              v-model="deletePassword"
              :placeholder="$t('settings.privacy.panels.deleteAccount.input2')"
            />
            <p v-if="deletePasswordError" class="error-message">{{ deletePasswordError }}</p>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="modal-button secondary" @click="closeDeleteAccountModal">{{ $t('settings.privacy.panels.deleteAccount.button1') }}</button>
          <button class="modal-button danger" @click="deleteAccount" :disabled="!isDeleteFormValid">{{ $t('settings.privacy.panels.deleteAccount.button2') }}</button>
        </div>
      </div>
    </div>
    
    <!-- Hide Profile Modal -->
    <div v-if="isHideProfileModalOpen" class="modal-overlay" @click="closeHideProfileModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h1 class="modal-title">{{ $t('settings.privacy.panels.hideProfile.title') }}</h1>
          <button class="modal-close" @click="closeHideProfileModal">×</button>
        </div>
        
        <div class="modal-body">
          <div class="warning-section">
            <p class="warning-text">{{ $t('settings.privacy.panels.hideProfile.h1') }}</p>
            <p class="warning-description">{{ $t('settings.privacy.panels.hideProfile.subtitle') }}</p>
          </div>
          
          <div class="form-group">
            <label class="form-label">{{ $t('settings.privacy.panels.hideProfile.h2') }}</label>
            <input 
              type="password" 
              class="form-input" 
              :class="{ 'error': hidePasswordError }"
              v-model="hidePassword"
              :placeholder="$t('settings.privacy.panels.hideProfile.input1')"
            />
            <p v-if="hidePasswordError" class="error-message">{{ hidePasswordError }}</p>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="modal-button secondary" @click="closeHideProfileModal">{{ $t('settings.privacy.panels.hideProfile.button1') }}</button>
          <button class="modal-button primary" @click="hideProfile" :disabled="!isHideFormValid">{{ $t('settings.privacy.panels.hideProfile.button2') }}</button>
        </div>
      </div>
    </div>
    
    <!-- Extra Lock Modal -->
    <div v-if="isExtraLockModalOpen" class="modal-overlay" @click="closeExtraLockModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h1 class="modal-title">{{ $t('settings.privacy.panels.lockProfile.title') }}</h1>
          <button class="modal-close" @click="closeExtraLockModal">×</button>
        </div>
        
        <div class="modal-body">
          <div class="warning-section">
            <p class="warning-text">{{ $t('settings.privacy.panels.lockProfile.h1') }}</p>
            <p class="warning-description">{{ $t('settings.privacy.panels.lockProfile.subtitle') }}</p>
          </div>
          
          <div class="form-group">
            <label class="form-label">{{ $t('settings.privacy.panels.lockProfile.h2') }}</label>
            <select class="form-select" v-model="lockDuration">
              <option value="1">{{ $t('settings.privacy.panels.lockProfile.lockDuration.1') }}</option>
              <option value="24">{{ $t('settings.privacy.panels.lockProfile.lockDuration.24') }}</option>
              <option value="168">{{ $t('settings.privacy.panels.lockProfile.lockDuration.168') }}</option>
              <option value="720">{{ $t('settings.privacy.panels.lockProfile.lockDuration.720') }}</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">{{ $t('settings.privacy.panels.lockProfile.h3') }}</label>
            <input 
              type="password" 
              class="form-input" 
              :class="{ 'error': lockPasswordError }"
              v-model="lockPassword"
              :placeholder="$t('settings.privacy.panels.lockProfile.input1')"
            />
            <p v-if="lockPasswordError" class="error-message">{{ lockPasswordError }}</p>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="modal-button secondary" @click="closeExtraLockModal">{{ $t('settings.privacy.panels.lockProfile.button1') }}</button>
          <button class="modal-button primary" @click="lockProfile" :disabled="!isLockFormValid">{{ $t('settings.privacy.panels.lockProfile.button2') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import SettingsSidebar from '@/components/SettingsSidebar.vue'
import { useValidation } from '@/composables/useValidation'

const { t } = useI18n()

const { validateEmail, validatePassword } = useValidation()

// Modal states
const isEmailModalOpen = ref(false)
const isPasswordModalOpen = ref(false)
const is2FAModalOpen = ref(false)
const isDeleteAccountModalOpen = ref(false)
const isHideProfileModalOpen = ref(false)
const isExtraLockModalOpen = ref(false)

// Email change form
const currentEmail = ref('')
const newEmail = ref('')
const emailPassword = ref('')
const currentEmailError = ref('')
const newEmailError = ref('')
const passwordError = ref('')

// Password change form
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const currentPasswordError = ref('')
const newPasswordError = ref('')
const confirmPasswordError = ref('')

// 2FA form
const twoFACode = ref('')
const twoFACodeError = ref('')
const twoFASecret = ref('ABCD EFGH IJKL MNOP QRST UVWX YZ12 3456')

// Delete account form
const deleteConfirm = ref('')
const deletePassword = ref('')
const deleteConfirmError = ref('')
const deletePasswordError = ref('')

// Hide profile form
const hidePassword = ref('')
const hidePasswordError = ref('')

// Extra lock form
const lockDuration = ref('24')
const lockPassword = ref('')
const lockPasswordError = ref('')

// Validation computed properties
const isEmailFormValid = computed(() => {
  return currentEmail.value && 
         newEmail.value && 
         emailPassword.value && 
         !currentEmailError.value && 
         !newEmailError.value && 
         !passwordError.value
})

const isPasswordFormValid = computed(() => {
  return currentPassword.value && 
         newPassword.value && 
         confirmPassword.value && 
         !currentPasswordError.value && 
         !newPasswordError.value && 
         !confirmPasswordError.value
})

const is2FAFormValid = computed(() => {
  return twoFACode.value.length === 6 && !twoFACodeError.value
})

const isDeleteFormValid = computed(() => {
  return deleteConfirm.value === 'DELETE' && 
         deletePassword.value && 
         !deleteConfirmError.value && 
         !deletePasswordError.value
})

const isHideFormValid = computed(() => {
  return hidePassword.value && !hidePasswordError.value
})

const isLockFormValid = computed(() => {
  return lockPassword.value && !lockPasswordError.value
})

// Email validation
watch(currentEmail, (newValue) => {
  if (newValue) {
    currentEmailError.value = validateEmail(newValue).isValid ? '' : validateEmail(newValue).message
  } else {
    currentEmailError.value = ''
  }
})

watch(newEmail, (newValue) => {
  if (newValue) {
    newEmailError.value = validateEmail(newValue).isValid ? '' : validateEmail(newValue).message
  } else {
    newEmailError.value = ''
  }
})

watch(emailPassword, (newValue) => {
  if (newValue) {
    passwordError.value = validatePassword(newValue).isValid ? '' : validatePassword(newValue).message
  } else {
    passwordError.value = ''
  }
})

// Password validation
watch(currentPassword, (newValue) => {
  if (newValue) {
    currentPasswordError.value = validatePassword(newValue).isValid ? '' : validatePassword(newValue).message
  } else {
    currentPasswordError.value = ''
  }
})

watch(newPassword, (newValue) => {
  if (newValue) {
    newPasswordError.value = validatePassword(newValue).isValid ? '' : validatePassword(newValue).message
  } else {
    newPasswordError.value = ''
  }
})

watch(confirmPassword, (newValue) => {
  if (newValue) {
    if (newValue !== newPassword.value) {
      confirmPasswordError.value = 'Passwords do not match'
    } else {
      confirmPasswordError.value = ''
    }
  } else {
    confirmPasswordError.value = ''
  }
})

// 2FA validation
watch(twoFACode, (newValue) => {
  if (newValue) {
    if (!/^\d{6}$/.test(newValue)) {
      twoFACodeError.value = 'Code must be 6 digits'
    } else {
      twoFACodeError.value = ''
    }
  } else {
    twoFACodeError.value = ''
  }
})

// Delete account validation
watch(deleteConfirm, (newValue) => {
  if (newValue && newValue !== 'DELETE') {
    deleteConfirmError.value = 'Please type "DELETE" exactly'
  } else {
    deleteConfirmError.value = ''
  }
})

watch(deletePassword, (newValue) => {
  if (newValue) {
    deletePasswordError.value = validatePassword(newValue).isValid ? '' : validatePassword(newValue).message
  } else {
    deletePasswordError.value = ''
  }
})

// Hide profile validation
watch(hidePassword, (newValue) => {
  if (newValue) {
    hidePasswordError.value = validatePassword(newValue).isValid ? '' : validatePassword(newValue).message
  } else {
    hidePasswordError.value = ''
  }
})

// Lock profile validation
watch(lockPassword, (newValue) => {
  if (newValue) {
    lockPasswordError.value = validatePassword(newValue).isValid ? '' : validatePassword(newValue).message
  } else {
    lockPasswordError.value = ''
  }
})

// Modal functions
const openEmailModal = () => {
  isEmailModalOpen.value = true
  resetEmailForm()
}

const closeEmailModal = () => {
  isEmailModalOpen.value = false
  resetEmailForm()
}

const openPasswordModal = () => {
  isPasswordModalOpen.value = true
  resetPasswordForm()
}

const closePasswordModal = () => {
  isPasswordModalOpen.value = false
  resetPasswordForm()
}

const open2FAModal = () => {
  is2FAModalOpen.value = true
  reset2FAForm()
}

const close2FAModal = () => {
  is2FAModalOpen.value = false
  reset2FAForm()
}

const openDeleteAccountModal = () => {
  isDeleteAccountModalOpen.value = true
  resetDeleteForm()
}

const closeDeleteAccountModal = () => {
  isDeleteAccountModalOpen.value = false
  resetDeleteForm()
}

const openHideProfileModal = () => {
  isHideProfileModalOpen.value = true
  resetHideForm()
}

const closeHideProfileModal = () => {
  isHideProfileModalOpen.value = false
  resetHideForm()
}

const openExtraLockModal = () => {
  isExtraLockModalOpen.value = true
  resetLockForm()
}

const closeExtraLockModal = () => {
  isExtraLockModalOpen.value = false
  resetLockForm()
}

// Reset functions
const resetEmailForm = () => {
  currentEmail.value = ''
  newEmail.value = ''
  emailPassword.value = ''
  currentEmailError.value = ''
  newEmailError.value = ''
  passwordError.value = ''
}

const resetPasswordForm = () => {
  currentPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  currentPasswordError.value = ''
  newPasswordError.value = ''
  confirmPasswordError.value = ''
}

const reset2FAForm = () => {
  twoFACode.value = ''
  twoFACodeError.value = ''
}

const resetDeleteForm = () => {
  deleteConfirm.value = ''
  deletePassword.value = ''
  deleteConfirmError.value = ''
  deletePasswordError.value = ''
}

const resetHideForm = () => {
  hidePassword.value = ''
  hidePasswordError.value = ''
}

const resetLockForm = () => {
  lockPassword.value = ''
  lockPasswordError.value = ''
  lockDuration.value = '24'
}

// Action functions
const changeEmail = async () => {
  if (!isEmailFormValid.value) return
  
  try {
    console.log('Changing email:', { currentEmail: currentEmail.value, newEmail: newEmail.value })
    alert('Email change request sent! Check your new email for confirmation.')
    closeEmailModal()
  } catch (error) {
    console.error('Error changing email:', error)
    alert('Error changing email. Please try again.')
  }
}

const changePassword = async () => {
  if (!isPasswordFormValid.value) return
  
  try {
    console.log('Changing password')
    alert('Password changed successfully!')
    closePasswordModal()
  } catch (error) {
    console.error('Error changing password:', error)
    alert('Error changing password. Please try again.')
  }
}

const setup2FA = async () => {
  if (!is2FAFormValid.value) return
  
  try {
    console.log('Setting up 2FA with code:', twoFACode.value)
    alert('2FA enabled successfully!')
    close2FAModal()
  } catch (error) {
    console.error('Error setting up 2FA:', error)
    alert('Error setting up 2FA. Please try again.')
  }
}

const downloadData = async () => {
  try {
    console.log('Downloading user data')
    alert('Data download started! You will receive an email with the download link.')
  } catch (error) {
    console.error('Error downloading data:', error)
    alert('Error downloading data. Please try again.')
  }
}

const deleteAccount = async () => {
  if (!isDeleteFormValid.value) return
  
  try {
    console.log('Deleting account')
    alert('Account deletion request submitted. You will receive a confirmation email.')
    closeDeleteAccountModal()
  } catch (error) {
    console.error('Error deleting account:', error)
    alert('Error deleting account. Please try again.')
  }
}

const hideProfile = async () => {
  if (!isHideFormValid.value) return
  
  try {
    console.log('Hiding profile')
    alert('Profile hidden successfully!')
    closeHideProfileModal()
  } catch (error) {
    console.error('Error hiding profile:', error)
    alert('Error hiding profile. Please try again.')
  }
}

const lockProfile = async () => {
  if (!isLockFormValid.value) return
  
  try {
    console.log('Locking profile for', lockDuration.value, 'hours')
    alert(`Profile locked for ${lockDuration.value} hours!`)
    closeExtraLockModal()
  } catch (error) {
    console.error('Error locking profile:', error)
    alert('Error locking profile. Please try again.')
  }
}
</script>

<style scoped lang="scss">
@import '@/assets/main.scss';

.settings-privacy-container {
  margin: 0 auto;
  background-color: var(--bg-primary);
  min-height: 100vh;
  padding: 0 16px;
  padding-top: calc(var(--header-height, 80px) + 10px);
  box-sizing: border-box;
  transition: padding-top 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  
  /* Мобильные устройства */
  @media (max-width: 768px) {
    padding: calc(var(--header-height, 60px) + 10px) 12px 0 12px;
  }
  
  /* Планшеты */
  @media (min-width: 769px) and (max-width: 1024px) {
    padding: calc(var(--header-height, 70px) + 10px) 20px 0 20px;
  }
  
  /* Десктоп */
  @media (min-width: 1025px) {
    padding: calc(var(--header-height, 80px) + 10px) 24px 0 24px;
  }
}

.main-body {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  margin-top: 48px;
  gap: 12px;
  max-width: 1600px;
  margin-left: auto;
  margin-right: auto;
}


// Content Styles
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.security-section {
  background-color: var(--bg-secondary);
  width: 980px;
  height: 600px;
  border-radius: 25px;
  display: flex;
  flex-direction: column;
}

.data-section {
  background-color: var(--bg-secondary);
  width: 980px;
  height: 430px;
  border-radius: 25px;
  margin-top: 12px;
  margin-bottom: 200px;
  display: flex;
  flex-direction: column;
}

.section-title {
  margin-top: 40px;
  margin-left: 48px;
  color: var(--text-primary);
  font-size: 25px;
  font-family: var(--font-sans);
  font-weight: bold;
}

.section-subtitle {
  color: var(--text-secondary);
  font-size: 20px;
  font-family: var(--font-sans);
  font-weight: bold;
  margin-top: 8px;
  margin-left: 48px;
  width: 700px;
}

// Security Options
.security-options {
  display: flex;
  flex-direction: column;
  margin-left: 48px;
  margin-top: 32px;
  gap: 16px;
}

.security-option {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}

.option-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.option-title {
  color: var(--text-primary);
  font-size: 25px;
  font-family: var(--font-sans);
  font-weight: bold;
  margin: 0;

  &.danger {
    color: var(--text-red);
  }
}

.option-subtitle {
  color: var(--text-secondary);
  font-size: 20px;
  font-family: var(--font-sans);
  font-weight: bold;
  margin-top: 4px;
  width: 660px;
}

.option-button {
  width: 300px;
  height: 59px;
  background-color: rgba(67, 73, 86, 0);
  border-radius: 15px;
  color: var(--text-primary);
  font-size: 20px;
  font-family: var(--font-sans);
  font-weight: bold;
  transition: all 0.3s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  margin-right: 48px;
  margin-top: 24px;

  &:hover {
    background-color: var(--ui-hover-bg);
  }

  &.danger {
    background-color: rgba(255, 59, 59, 0);
    color: var(--text-red);

    &:hover {
      background-color: rgba(255, 59, 59, 1);
      color: var(--text-primary);
    }
  }
}

// Data Options
.data-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-left: 48px;
  margin-top: 16px;
}

.data-option {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}

// Modal Styles
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.modal-content {
  background-color: var(--bg-secondary);
  border-radius: 30px;
  width: 600px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 24px 72px rgba(0, 0, 0, 0.3);
  
  &.danger-modal {
    border: 2px solid var(--text-red);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 29px 38px;
  
  @include responsive-2k {
    padding: 40.6px 53.2px;
  }
  
  @include responsive-4k {
    padding: 52.2px 68.4px;
  }
  border-bottom: 1px solid var(--text-secondary);
}

.modal-title {
  color: var(--text-primary);
  font-size: 29px;
  font-family: var(--font-sans);
  font-weight: bold;
  margin: 0;
  
  &.danger {
    color: var(--text-red);
  }
}

.modal-close {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 38px;
  cursor: pointer;
  padding: 0;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(67, 73, 86, 1);
    color: var(--text-primary);
  }
}

.modal-body {
  padding: 38px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 19px;
  padding: 29px 38px;
  border-top: 1px solid var(--text-secondary);
}

.modal-button {
  padding: 14px 29px;
  border-radius: 18px;
  font-size: 19px;
  font-family: var(--font-sans);
  font-weight: bold;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &.secondary {
    background-color: rgba(67, 73, 86, 0);
    color: var(--text-primary);
    
    &:hover {
      background-color: rgba(67, 73, 86, 1);
    }
  }
  
  &.primary {
    background-color: var(--primary-violet);
    color: white;
    
    &:hover {
      background-color: #7c3aed;
    }
    
    &:disabled {
      background-color: var(--text-secondary);
      cursor: not-allowed;
    }
  }
  
  &.danger {
    background-color: var(--text-red);
    color: white;
    
    &:hover {
      background-color: #dc2626;
    }
    
    &:disabled {
      background-color: var(--text-secondary);
      cursor: not-allowed;
    }
  }
}

// Form Styles
.form-group {
  margin-bottom: 29px;
}

.form-label {
  display: block;
  color: var(--text-primary);
  font-size: 19px;
  font-family: var(--font-sans);
  font-weight: bold;
  margin-bottom: 10px;
}

.form-input {
  width: 100%;
  padding: 14px 19px;
  border: 2px solid var(--text-secondary);
  border-radius: 18px;
  background-color: var(--btn-primary);
  color: #ffffff;
  font-size: 19px;
  font-family: var(--font-sans);
  font-weight: 600;
  transition: all 0.3s ease;
  opacity: 1;
  
  &:focus {
    outline: none;
    border-color: var(--primary-violet);
    color: #ffffff;
    opacity: 1;
  }
  
  &.error {
    border-color: var(--text-red);
  }
  
  &::placeholder {
    color: var(--text-secondary);
    opacity: 0.8;
  }
}

.form-select {
  width: 100%;
  padding: 14px 19px;
  border: 2px solid var(--text-secondary);
  border-radius: 18px;
  background-color: var(--btn-primary);
  color: #ffffff;
  font-size: 19px;
  font-family: var(--font-sans);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 1;
  
  &:focus {
    outline: none;
    border-color: var(--primary-violet);
    color: #ffffff;
    opacity: 1;
  }
}

.error-message {
  color: var(--text-red);
  font-size: 17px;
  font-family: var(--font-sans);
  margin-top: 5px;
  margin-bottom: 0;
}

// Special sections
.warning-section {
  background-color: rgba(255, 59, 59, 0.1);
  border: 1px solid var(--text-red);
  border-radius: 18px;
  padding: 19px;
  margin-bottom: 29px;
}

.warning-text {
  color: var(--text-red);
  font-size: 19px;
  font-family: var(--font-sans);
  font-weight: bold;
  margin: 0 0 10px 0;
}

.warning-description {
  color: var(--text-secondary);
  font-size: 17px;
  font-family: var(--font-sans);
  margin: 0;
}

.twofa-info {
  text-align: center;
  margin-bottom: 29px;
}

.info-text {
  color: var(--text-primary);
  font-size: 19px;
  font-family: var(--font-sans);
  margin-bottom: 19px;
}

.qr-code-placeholder {
  display: flex;
  justify-content: center;
  margin: 19px 0;
}

.qr-code {
  width: 180px;
  height: 180px;
  background-color: var(--btn-primary);
  border: 2px solid var(--text-secondary);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  font-size: 17px;
  font-family: var(--font-sans);
  font-weight: bold;
}

.manual-code {
  background-color: var(--btn-primary);
  border: 1px solid var(--text-secondary);
  border-radius: 12px;
  padding: 14px;
  color: var(--text-primary);
  font-size: 19px;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  letter-spacing: 2px;
  margin: 19px auto;
  max-width: 360px;
  word-break: break-all;
}
</style>