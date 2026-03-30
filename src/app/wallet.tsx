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
    } catch (err) {
      Alert.alert('Error', `Failed to ${modalType}`);
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
          colors={[Colors.primary, Colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(wallet?.balance || 0)}</Text>
          <View style={styles.cardFooter}>
            <View style={styles.cardDot} />
            <Text style={styles.cardStatus}>Secured by Worknest Pay</Text>
          </View>
        </LinearGradient>

        <View style={styles.buttonGroup}>
          <Button
            title="Add Cash"
            onPress={() => handleOpenModal('deposit')}
            style={styles.actionBtn}
          />
          <Button
            title="Withdraw"
            variant="outline"
            onPress={() => handleOpenModal('withdraw')}
            style={styles.actionBtn}
          />
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
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    ...Shadows.lg,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600' as any,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  balanceAmount: {
    fontSize: 38,
    fontWeight: '800' as any,
    color: '#FFFFFF',
    marginVertical: 12,
  },
  cardFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  cardDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.accent, marginRight: 8 },
  cardStatus: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '500' as any },
  buttonGroup: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  actionBtn: { flex: 1, borderRadius: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  transactionTitle: { fontSize: 18, fontWeight: '700' as any, color: Colors.text },
  viewAll: { fontSize: 14, color: Colors.primary, fontWeight: '600' as any },
  transactionCard: { padding: 0, overflow: 'hidden' },
  amount: { fontSize: 15, fontWeight: '700' as any },
  credit: { color: Colors.success },
  debit: { color: Colors.danger },
  emptyCard: { padding: 40, alignItems: 'center', backgroundColor: Colors.gray[50] },
  emptyText: { fontSize: 16, color: Colors.textLight, marginTop: 12, fontWeight: '500' as any },
  separator: { height: 1, backgroundColor: Colors.gray[100], marginLeft: 56 },
  spacing: { height: 40 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 24,
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
    fontSize: 20,
    fontWeight: '700' as any,
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
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    marginBottom: 24,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '700' as any,
    color: Colors.text,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700' as any,
    color: Colors.text,
    paddingVertical: 12,
  },
  submitBtn: {
    borderRadius: 16,
    height: 56,
  },
});
