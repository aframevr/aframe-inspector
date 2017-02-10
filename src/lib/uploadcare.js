import {injectJS} from './utils';

export default function initUploadCare () {
  window.UPLOADCARE_PUBLIC_KEY = 'f43ad452b58f9e853d05';
  if (!window.uploadcare) {
    injectJS('https://ucarecdn.com/widget/2.10.0/uploadcare/uploadcare.full.min.js');
  }
}
