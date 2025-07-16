export interface VersionHistory {
  version: string;
  releaseDate: string;
  releaseNotes: string;
  isCurrent: boolean;
  isMajor?: boolean;
  isBreaking?: boolean;
}

export interface UpdateInfo {
  version: string;
  releaseDate: string;
  releaseNotes?: string;
}

export interface UpdateProgress {
  percent: number;
  bytesPerSecond: number;
  total: number;
  transferred: number;
}

// Histórico de versões - você pode atualizar este array conforme lança novas versões
export const versionHistory: VersionHistory[] = [
  {
    version: '1.3.18',
    releaseDate: '2025-07-14',
    releaseNotes: '• melhorias na interface\n• instalação de servidor minecraft',
    isCurrent: true,
    isMajor: false
  },
  {
    version: '1.3.17',
    releaseDate: '2025-07-12',
    releaseNotes: '• correções de bugs\n• melhorias na interface\n• Monitoramnento inteligente',
    isCurrent: false,
    isMajor: false
  },
  {
    version: '1.3.14',
    releaseDate: '2025-07-12',
    releaseNotes: '• correções de bugs\n• melhorias na interface\n• adicionado sugestões de presets BY LIVHE',
    isCurrent: false,
    isMajor: false
  },
  {
    version: '1.2.14',
    releaseDate: '2025-07-11',
    releaseNotes: '• correções de bugs\n• melhorias na interface',
    isCurrent: false,
    isMajor: false
  },
  {
    version: '1.2.13',
    releaseDate: '2025-07-11',
    releaseNotes: '• correções de bugs\n• adicionado teste devolume ao preset\n• adicionado splash screen',
    isCurrent: false,
    isMajor: false
  },
  {
    version: '1.2.12',
    releaseDate: '2025-07-11',
    releaseNotes: '• correções de bugs\n• adicionado volume ao preset\n• adicionado quantidade de execuções de ações para jogos ',
    isCurrent: false,
    isMajor: false
  },
  {
    version: '1.2.11',
    releaseDate: '2025-07-10',
    releaseNotes: '• correções de bugs',
    isCurrent: false,
    isMajor: false
  },
  {
    version: '1.2.9',
    releaseDate: '2025-07-07',
    releaseNotes: '• Inicialização app sempre com modo administrador\n• correções de bugs',
    isCurrent: false,
    isMajor: false
  },
  // {
  //   version: '1.2.7',
  //   releaseDate: '2025-06-26',
  //   releaseNotes: '• implementação sistema de interações com GTA V chaosMood\n• instalação automática do chaosMood e scriptHookV\n• correções de bugs',
  //   isCurrent: false,
  //   isMajor: false
  // },
  // {
  //   version: '1.1.7',
  //   releaseDate: '2025-06-23',
  //   releaseNotes: '• Correções de bugs gerais\n• Melhorias na performance\n• Atualização da interface de gifts GLOBAIS',
  //   isCurrent: false,
  //   isMajor: false
  // },
  // {
  //   version: '1.1.6',
  //   releaseDate: '2025-06-18',
  //   releaseNotes: '• Correções de bugs gerais\n• Melhorias na performance\n• Atualização da interface do usuário\n• Nova página de atualizações',
  //   isCurrent: false,
  //   isMajor: false
  // },
  // // {
  // //   version: '1.1.5',
  // //   releaseDate: '2024-01-10',
  // //   releaseNotes: '• Adicionado sistema de notificações\n• Melhorias na integração com TikTok\n• Correções de segurança\n• Otimizações de performance',
  // //   isCurrent: false,
  // //   isMajor: false
  // // },
  // // {
  // //   version: '1.1.4',
  // //   releaseDate: '2024-01-05',
  // //   releaseNotes: '• Nova funcionalidade de overlay\n• Melhorias na autenticação\n• Otimizações de performance\n• Correções de bugs menores',
  // //   isCurrent: false,
  // //   isMajor: false
  // // },
  // // {
  // //   version: '1.1.3',
  // //   releaseDate: '2023-12-28',
  // //   releaseNotes: '• Correções de bugs críticos\n• Melhorias na interface\n• Atualização das dependências\n• Melhorias na estabilidade',
  // //   isCurrent: false,
  // //   isMajor: false
  // // },
  // // {
  // //   version: '1.1.2',
  // //   releaseDate: '2023-12-20',
  // //   releaseNotes: '• Adicionado sistema de pagamentos\n• Melhorias na experiência do usuário\n• Correções menores\n• Nova funcionalidade de planos',
  // //   isCurrent: false,
  // //   isMajor: false
  // // },
  // // {
  // //   version: '1.1.1',
  // //   releaseDate: '2023-12-15',
  // //   releaseNotes: '• Primeira versão estável\n• Funcionalidades básicas implementadas\n• Interface inicial\n• Sistema de autenticação',
  // //   isCurrent: false,
  // //   isMajor: false
  // // },
  {
    version: '1.0.0',
    releaseDate: '2025-05-18',
    releaseNotes: '• Lançamento inicial do LIVHE\n• Funcionalidades básicas\n• Interface simples\n• Integração com TikTok',
    isCurrent: false,
    isMajor: true
  }
];

// Função para obter a versão atual
export const getCurrentVersion = (): string => {
  const current = versionHistory.find(v => v.isCurrent);
  return current ? current.version : '1.1.7';
};

// Função para obter o histórico de versões
export const getVersionHistory = (): VersionHistory[] => {
  return versionHistory;
};

// Função para obter informações de uma versão específica
export const getVersionInfo = (version: string): VersionHistory | undefined => {
  return versionHistory.find(v => v.version === version);
};

// Função para verificar se uma versão é mais recente que outra
export const isVersionNewer = (version1: string, version2: string): boolean => {
  const v1Parts = version1.split('.').map(Number);
  const v2Parts = version2.split('.').map(Number);

  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1 = v1Parts[i] || 0;
    const v2 = v2Parts[i] || 0;

    if (v1 > v2) return true;
    if (v1 < v2) return false;
  }

  return false;
};

// Função para formatar a data de lançamento
export const formatReleaseDate = (dateString: string, locale: string = 'pt-BR'): string => {
  return new Date(dateString).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Função para obter as últimas N versões
export const getLatestVersions = (count: number = 5): VersionHistory[] => {
  return versionHistory.slice(0, count);
};

// Função para obter apenas versões major
export const getMajorVersions = (): VersionHistory[] => {
  return versionHistory.filter(v => v.isMajor);
}; 