import { base44 } from './clientReal';

export const Core = base44.integrations.Core;

export const InvokeLLM = base44.integrations.Core.InvokeLLM;

export const SendEmail = base44.integrations.Core.SendEmail;

export const UploadFile = base44.integrations.Core.UploadFile;

export const GenerateImage = base44.integrations.Core.GenerateImage;

// These are optional/mocked in clientReal.js but expected by some imports?
// Let's check if they are in clientReal.js
// clientReal.js has InvokeLLM, SendEmail, UploadFile, GenerateImage.
// It does NOT have ExtractDataFromUploadedFile, CreateFileSignedUrl, UploadPrivateFile.
// I should add them to clientReal.js as mocks/placeholders or implementation.

export const ExtractDataFromUploadedFile = base44.integrations.Core.ExtractDataFromUploadedFile || (async () => { console.warn('Not implemented'); return {}; });

export const CreateFileSignedUrl = base44.integrations.Core.CreateFileSignedUrl || (async () => { console.warn('Not implemented'); return {}; });

export const UploadPrivateFile = base44.integrations.Core.UploadPrivateFile || (async () => { console.warn('Not implemented'); return {}; });
