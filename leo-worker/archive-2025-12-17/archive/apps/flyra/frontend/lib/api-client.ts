// API Client following technical specification patterns

const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const CURRENT_USER_KEY = 'current_user';
const CURRENT_WORKSPACE_KEY = 'current_workspace';

export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export type ErrorCode = 
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'SERVER_ERROR'
  | 'NETWORK_ERROR'
  | 'INVALID_CREDENTIALS'
  | 'DUPLICATE_RESOURCE';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    this.restoreToken();
  }

  // Token management
  private restoreToken() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem(AUTH_TOKEN_KEY);
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
      } else {
        localStorage.removeItem(AUTH_TOKEN_KEY);
      }
    }
  }

  // Main request method with error handling
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
          ...(options.headers as Record<string, string>),
        },
      });

      if (!response.ok) {
        await this.handleHttpError(response);
      }

      // Handle empty responses
      const text = await response.text();
      if (!text) return {} as T;
      
      return JSON.parse(text);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        'Network error. Please check your connection.',
        'NETWORK_ERROR'
      );
    }
  }

  private getAuthHeaders(): Record<string, string> {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }

  private async handleHttpError(response: Response) {
    let data: any = {};
    try {
      const text = await response.text();
      if (text) {
        data = JSON.parse(text);
      }
    } catch {
      // Ignore JSON parse errors
    }

    switch (response.status) {
      case 401:
        this.handleUnauthorized();
        break;
      case 403:
        throw new ApiError(
          'You do not have permission to perform this action',
          'FORBIDDEN',
          403
        );
      case 404:
        throw new ApiError(
          'The requested resource was not found',
          'NOT_FOUND',
          404
        );
      case 429:
        const retryAfter = response.headers.get('Retry-After');
        throw new ApiError(
          `Rate limited. Try again in ${retryAfter || '60'} seconds`,
          'RATE_LIMITED',
          429
        );
      case 400:
        throw new ApiError(
          data.detail || 'Invalid request',
          'VALIDATION_ERROR',
          400
        );
      case 500:
      case 502:
      case 503:
      case 504:
        throw new ApiError(
          'Server error. Please try again later.',
          'SERVER_ERROR',
          response.status
        );
      default:
        throw new ApiError(
          data.detail || 'An error occurred',
          'UNKNOWN_ERROR',
          response.status
        );
    }
  }

  private handleUnauthorized() {
    // Clear all auth data
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(CURRENT_WORKSPACE_KEY);
    this.token = null;

    // Redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  // Mock API endpoints - replace with real endpoints in production
  
  // Auth endpoints
  async login(email: string, password: string) {
    // Mock login - in production, this would hit the real API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email === 'demo@flyra.com' && password === 'Demo123!') {
      const mockUser = {
        id: '1',
        email: 'demo@flyra.com',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+1234567890',
        dateOfBirth: '1990-01-01',
        ssnLast4: '1234',
        address: {
          street: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94105',
          country: 'US'
        },
        kycStatus: 'approved' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockTokens = {
        access_token: 'mock-jwt-token',
        refresh_token: 'mock-refresh-token',
        user: mockUser,
      };

      return mockTokens;
    }
    
    throw new ApiError('Invalid email or password', 'INVALID_CREDENTIALS', 401);
  }

  async logout() {
    // Mock logout
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  async getSession() {
    // Mock session check
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (this.token) {
      return {
        valid: true,
        user: JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || '{}'),
      };
    }
    
    throw new ApiError('No session', 'UNAUTHORIZED', 401);
  }

  // Registration endpoints
  async register(data: any) {
    // Mock registration
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Check if email already exists
    if (data.email === 'existing@email.com') {
      throw new ApiError('Email already registered', 'DUPLICATE_RESOURCE', 400);
    }
    
    return {
      success: true,
      message: 'Registration successful',
    };
  }

  async sendVerificationCode(phoneNumber: string) {
    // Mock sending verification code
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true };
  }

  async verifyPhone(phoneNumber: string, code: string) {
    // Mock phone verification
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (code === '123456') {
      return { success: true };
    }
    
    throw new ApiError('Invalid verification code', 'VALIDATION_ERROR', 400);
  }

  // Wallet endpoints
  async getWallet() {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      id: '1',
      userId: '1',
      balance: 2500.00,
      currency: 'USDC' as const,
      status: 'active' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async fundWallet(amount: number, bankAccountId: string) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      success: true,
      transactionId: `DEP${Date.now()}`,
      amount,
      estimatedArrival: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  // Recipients endpoints
  async getRecipients() {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return [
      {
        id: '1',
        userId: '1',
        firstName: 'Jane',
        lastName: 'Smith',
        phoneNumber: '+254712345678',
        country: 'KE',
        city: 'Nairobi',
        mobileMoneyProvider: 'M-PESA',
        relationship: 'family' as const,
        isFavorite: true,
        lastTransactionDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        userId: '1',
        firstName: 'Robert',
        lastName: 'Johnson',
        phoneNumber: '+2348012345678',
        country: 'NG',
        city: 'Lagos',
        mobileMoneyProvider: 'MTN Mobile Money',
        relationship: 'friend' as const,
        isFavorite: false,
        lastTransactionDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  async addRecipient(data: any) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      id: Date.now().toString(),
      userId: '1',
      ...data,
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async createRecipient(data: any) {
    return this.addRecipient(data);
  }

  async getRecipient(id: string) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const recipients = await this.getRecipients();
    const recipient = recipients.find(r => r.id === id);
    
    if (!recipient) {
      throw new ApiError('Recipient not found', 'NOT_FOUND', 404);
    }
    
    return recipient;
  }

  async updateRecipient(id: string, data: any) {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const recipient = await this.getRecipient(id);
    
    return {
      ...recipient,
      ...data,
      updatedAt: new Date().toISOString(),
    };
  }

  async deleteRecipient(id: string) {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // In a real app, this would delete from the database
    return { success: true };
  }

  // Transaction endpoints
  async sendMoney(data: any) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if sufficient balance
    const wallet = await this.getWallet();
    if (wallet.balance < data.totalAmount) {
      throw new ApiError('Insufficient balance', 'VALIDATION_ERROR', 400);
    }
    
    return {
      id: `TXN${Date.now()}`,
      status: 'completed',
      amount: data.amount,
      fee: data.fee,
      totalAmount: data.totalAmount,
      localAmount: data.localAmount,
      localCurrency: data.localCurrency,
      exchangeRate: data.exchangeRate,
      completedAt: new Date().toISOString(),
    };
  }

  async getTransactions() {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    const recipients = await this.getRecipients();
    
    return [
      {
        id: 'TXN1',
        userId: '1',
        recipientId: '1',
        recipient: recipients[0],
        amount: 100,
        fee: 2.99,
        totalAmount: 102.99,
        exchangeRate: 156.50,
        localAmount: 15650,
        localCurrency: 'KES',
        status: 'completed' as const,
        type: 'send' as const,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30000).toISOString(),
      },
      {
        id: 'TXN2',
        userId: '1',
        recipientId: '2',
        recipient: recipients[1],
        amount: 250,
        fee: 2.99,
        totalAmount: 252.99,
        exchangeRate: 1520.00,
        localAmount: 380000,
        localCurrency: 'NGN',
        status: 'completed' as const,
        type: 'send' as const,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 45000).toISOString(),
      },
      {
        id: 'DEP1',
        userId: '1',
        recipientId: '1',
        recipient: recipients[0], // Required by type, but not relevant for deposits
        amount: 500,
        fee: 0,
        totalAmount: 500,
        exchangeRate: 1,
        localAmount: 500,
        localCurrency: 'USD',
        status: 'completed' as const,
        type: 'deposit' as const,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'DEP2',
        userId: '1',
        recipientId: '1',
        recipient: recipients[0], // Required by type, but not relevant for deposits
        amount: 1000,
        fee: 0,
        totalAmount: 1000,
        exchangeRate: 1,
        localAmount: 1000,
        localCurrency: 'USD',
        status: 'completed' as const,
        type: 'deposit' as const,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'WTH1',
        userId: '1',
        recipientId: '1',
        recipient: recipients[0], // Required by type, but not relevant for withdrawals
        amount: 200,
        fee: 0,
        totalAmount: 200,
        exchangeRate: 1,
        localAmount: 200,
        localCurrency: 'USD',
        status: 'completed' as const,
        type: 'withdrawal' as const,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
  }

  // Dashboard stats
  async getDashboardStats() {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const [wallet, recipients, transactions] = await Promise.all([
      this.getWallet(),
      this.getRecipients(),
      this.getTransactions(),
    ]);
    
    return {
      totalSent: transactions.reduce((sum, t) => sum + t.amount, 0),
      totalRecipients: recipients.length,
      activeRecurringTransfers: 1,
      walletBalance: wallet.balance,
      recentTransactions: transactions.slice(0, 5),
      upcomingRecurringPayments: [],
    };
  }

  // Countries and providers
  async getSupportedCountries() {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return [
      {
        code: 'KE',
        name: 'Kenya',
        currency: 'KES',
        phoneCode: '+254',
        flag: '🇰🇪',
        isSupported: true,
        mobileMoneyProviders: [
          { id: '1', name: 'M-PESA', country: 'KE', deliveryTime: 'Instant', fee: 0, isActive: true },
          { id: '2', name: 'Airtel Money', country: 'KE', deliveryTime: 'Instant', fee: 0, isActive: true },
        ],
      },
      {
        code: 'NG',
        name: 'Nigeria',
        currency: 'NGN',
        phoneCode: '+234',
        flag: '🇳🇬',
        isSupported: true,
        mobileMoneyProviders: [
          { id: '3', name: 'MTN Mobile Money', country: 'NG', deliveryTime: 'Instant', fee: 0, isActive: true },
          { id: '4', name: 'Airtel Money', country: 'NG', deliveryTime: 'Instant', fee: 0, isActive: true },
        ],
      },
      {
        code: 'IN',
        name: 'India',
        currency: 'INR',
        phoneCode: '+91',
        flag: '🇮🇳',
        isSupported: true,
        mobileMoneyProviders: [
          { id: '5', name: 'PayTM', country: 'IN', deliveryTime: 'Instant', fee: 0, isActive: true },
          { id: '6', name: 'PhonePe', country: 'IN', deliveryTime: 'Instant', fee: 0, isActive: true },
          { id: '7', name: 'Google Pay', country: 'IN', deliveryTime: 'Instant', fee: 0, isActive: true },
        ],
      },
    ];
  }

  // Bank accounts
  async getBankAccounts() {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        id: '1',
        userId: '1',
        accountName: 'John Doe',
        accountNumber: '****1234',
        routingNumber: '****5678',
        bankName: 'Chase Bank',
        accountType: 'checking' as const,
        isVerified: true,
        isDefault: true,
        createdAt: new Date().toISOString(),
      },
    ];
  }

  async connectBankAccount(data: any) {
    // Mock Plaid connection
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      id: Date.now().toString(),
      userId: '1',
      ...data,
      isVerified: true,
      isDefault: false,
      createdAt: new Date().toISOString(),
    };
  }

  // Recurring transfers
  async getRecurringTransfers() {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const recipients = await this.getRecipients();
    
    return [
      {
        id: '1',
        userId: '1',
        recipientId: '1',
        recipient: recipients[0],
        amount: 200,
        frequency: 'monthly' as const,
        dayOfMonth: 15,
        startDate: new Date().toISOString(),
        nextPaymentDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active' as const,
        totalTransfers: 3,
        completedTransfers: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  async createRecurringTransfer(data: any) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      id: Date.now().toString(),
      userId: '1',
      ...data,
      status: 'active',
      totalTransfers: 0,
      completedTransfers: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

// Export singleton instance
export const apiClient = new ApiClient();