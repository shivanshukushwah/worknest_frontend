import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Screen, Card, Button, ListItem } from '@components/index';
import { walletAPI } from '@api/index';
import { Wallet, Transaction } from '@mytypes/index';
import { formatCurrency, formatDate } from '@utils/formatting';
import { Colors, Shadows } from '@utils/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function WalletScreen() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchWalletData = async () => {
    try {
      setIsLoading(true);
      const walletRes = await walletAPI.getWallet();

      if (walletRes.success && walletRes.data) {
        setWallet(walletRes.data);
        const transRes = await walletAPI.getTransactions(1, 10);
        if (transRes.success && transRes.data) {
          setTransactions(transRes.data);
        }
      }
    } catch (err: any) {
      console.warn('Failed to load wallet data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWalletData();
    setRefreshing(false);
  };

  const handleOpenModal = (type: 'deposit' | 'withdraw') => {
    setModalType(type);
    setAmount('');
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      setIsSubmitting(true);
      if (modalType === 'deposit') {
        const res = await walletAPI.initiateDeposit(Number(amount));
        if (res.success) {
          Alert.alert('Success', 'Deposit initiated successfully!');
          setModalVisible(false);
          fetchWalletData();
        }
      } else {
        const res = await walletAPI.createWithdrawalRequest({ amount: Number(amount) });
        if (res.success) {
          Alert.alert('Success', 'Withdrawal request submitted successfully');
          setModalVisible(false);
          fetchWalletData();
        }
      }
    } catch (err: any) {
      console.error(`Wallet: ${modalType} error:`, err?.message || err);
      if (err.response?.data) {
        console.log('Wallet: error details:', JSON.stringify(err.response.data, null, 2));
      }
      const msg = err.response?.data?.message || err.message || `Failed to ${modalType}`;
      Alert.alert('Error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Screen scrollable={false}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[Colors.primaryDark, Colors.secondaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <View style={styles.chip}>
              <Text style={styles.chipText}>SECURE</Text>
            </View>
          </View>
          <Text style={styles.balanceAmount}>{formatCurrency(wallet?.balance || 0)}</Text>
          <View style={styles.cardFooter}>
            <Ionicons name="shield-checkmark" size={16} color="rgba(255,255,255,0.6)" />
            <Text style={styles.cardStatus}>Protected by Worknest Escrow</Text>
          </View>
        </LinearGradient>

        <View style={styles.buttonGroup}>
          <TouchableOpacity 
            style={[styles.bigActionBtn, { backgroundColor: Colors.primary }]}
            onPress={() => handleOpenModal('deposit')}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={styles.btnGradient}
            >
              <Ionicons name="add-circle" size={24} color={Colors.white} />
              <Text style={styles.bigActionBtnText}>Add Cash</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.bigActionBtn, { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.primaryLight }]}
            onPress={() => handleOpenModal('withdraw')}
          >
            <View style={styles.btnGradient}>
              <Ionicons name="arrow-down-circle-outline" size={24} color={Colors.primary} />
              <Text style={[styles.bigActionBtnText, { color: Colors.primary }]}>Withdraw</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {modalType === 'deposit' ? 'Add Cash' : 'Withdraw Cash'}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color={Colors.textLight} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitle}>
                Enter the amount you want to {modalType === 'deposit' ? 'deposit' : 'withdraw'} below.
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0.00"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  autoFocus
                />
              </View>

              <Button
                title={modalType === 'deposit' ? 'Add Cash' : 'Withdraw Cash'}
                onPress={handleSubmit}
                loading={isSubmitting}
                style={styles.submitBtn}
              />
            </View>
          </KeyboardAvoidingView>
        </Modal>

        <View style={styles.sectionHeader}>
          <Text style={styles.transactionTitle}>Transaction History</Text>
          <Text style={styles.viewAll}>View All</Text>
        </View>

        {transactions.length > 0 ? (
          <Card style={styles.transactionCard}>
            {transactions.map((transaction, index) => (
              <View key={transaction.id}>
                <ListItem
                  title={transaction.description}
                  subtitle={formatDate(transaction.createdAt)}
                  icon={transaction.type === 'credit' || transaction.type === 'deposit' ? 'add-circle' : 'remove-circle'}
                  iconColor={transaction.type === 'credit' || transaction.type === 'deposit' ? Colors.success : Colors.danger}
                  trailing={
                    <Text
                      style={[
                        styles.amount,
                        transaction.type === 'credit' || transaction.type === 'deposit'
                          ? styles.credit
                          : styles.debit,
                      ]}
                    >
                      {transaction.type === 'credit' || transaction.type === 'deposit' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </Text>
                  }
                />
                {index < transactions.length - 1 && <View style={styles.separator} />}
              </View>
            ))}
          </Card>
        ) : (
          <Card style={styles.emptyCard}>
            <Ionicons name="receipt-outline" size={48} color={Colors.gray[300]} />
            <Text style={styles.emptyText}>No transactions found</Text>
          </Card>
        )}

        <View style={styles.spacing} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  contentContainer: { padding: 20 },
  balanceCard: {
    borderRadius: 32,
    padding: 24,
    marginBottom: 24,
    ...Shadows.lg,
    minHeight: 180,
    justifyContent: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600' as any,
    letterSpacing: 1,
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  chipText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700' as any,
  },
  balanceAmount: {
    fontSize: 42,
    fontWeight: '800' as any,
    color: '#FFFFFF',
    marginVertical: 4,
  },
  cardFooter: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 12,
    gap: 6,
  },
  cardStatus: { 
    fontSize: 12, 
    color: 'rgba(255,255,255,0.6)', 
    fontWeight: '500' as any 
  },
  buttonGroup: { 
    flexDirection: 'row', 
    gap: 16, 
    marginBottom: 32 
  },
  bigActionBtn: { 
    flex: 1, 
    height: 70,
    borderRadius: 20, 
    overflow: 'hidden',
    ...Shadows.md,
  },
  btnGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  bigActionBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700' as any,
  },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  transactionTitle: { 
    fontSize: 18, 
    fontWeight: '700' as any, 
    color: Colors.text 
  },
  viewAll: { 
    fontSize: 14, 
    color: Colors.primary, 
    fontWeight: '600' as any 
  },
  transactionCard: { 
    padding: 0, 
    overflow: 'hidden',
    borderRadius: 24,
  },
  amount: { fontSize: 15, fontWeight: '700' as any },
  credit: { color: Colors.success },
  debit: { color: Colors.danger },
  emptyCard: { 
    padding: 40, 
    alignItems: 'center', 
    backgroundColor: Colors.gray[50],
    borderRadius: 24,
  },
  emptyText: { 
    fontSize: 16, 
    color: Colors.textLight, 
    marginTop: 12, 
    fontWeight: '500' as any 
  },
  separator: { 
    height: 1, 
    backgroundColor: Colors.gray[100], 
    marginLeft: 56 
  },
  spacing: { height: 40 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 32,
    padding: 24,
    ...Shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800' as any,
    color: Colors.text,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 24,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[50],
    borderRadius: 20,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: Colors.gray[200],
    marginBottom: 24,
    height: 70,
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: '800' as any,
    color: Colors.primary,
    marginRight: 10,
  },
  amountInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: '800' as any,
    color: Colors.text,
    paddingVertical: 12,
  },
  submitBtn: {
    borderRadius: 20,
    height: 60,
  },
});
