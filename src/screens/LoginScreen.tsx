import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

interface LoginErrors {
  email?: string;
  password?: string;
}

interface LoginScreenProps {
  navigation?: { goBack: () => void };
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = (): LoginErrors => {
    const newErrors: LoginErrors = {};
    if (email.trim() === '') {
      newErrors.email = 'El correo o usuario es obligatorio';
    }
    if (password.trim() === '') {
      newErrors.password = 'La contraseña es obligatoria';
    }
    return newErrors;
  };

  const clearError = (field: keyof LoginErrors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = () => {
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    // Simular llamada a API
    setTimeout(() => {
      setIsSubmitting(false);
      setIsLoggedIn(true);
    }, 1500);
  };

  // Estado de éxito
  if (isLoggedIn) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successIconCircle}>
            <Ionicons name="checkmark" size={56} color={Colors.textPrimary} />
          </View>
          <Text style={styles.successTitle}>¡Bienvenido a MangaTools!</Text>
          <Text style={styles.successSubtitle}>
            Has iniciado sesión correctamente.
          </Text>
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={() => setIsLoggedIn(false)}
          >
            <Text style={styles.buttonText}>Continuar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      {/* Botón volver */}
      <TouchableOpacity
        style={styles.backButton}
        activeOpacity={0.7}
        onPress={() => navigation?.goBack()}
      >
        <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
      </TouchableOpacity>

      {/* Encabezado */}
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name="person" size={36} color={Colors.accentPrimary} />
        </View>
        <Text style={styles.title}>Iniciar Sesión</Text>
        <Text style={styles.subtitle}>
          Ingresa tus credenciales para acceder
        </Text>
      </View>

      {/* Formulario */}
      <View style={styles.form}>
        {/* Campo correo */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Correo o Usuario</Text>
          <View
            style={[
              styles.inputWrapper,
              errors.email && styles.inputWrapperError,
            ]}
          >
            <Ionicons
              name="mail-outline"
              size={20}
              color={errors.email ? Colors.error : Colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="usuario@correo.com"
              placeholderTextColor={Colors.textSecondary}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                clearError('email');
              }}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          {errors.email ? (
            <Text style={styles.errorText}>{errors.email}</Text>
          ) : null}
        </View>

        {/* Campo contraseña */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contraseña</Text>
          <View
            style={[
              styles.inputWrapper,
              errors.password && styles.inputWrapperError,
            ]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={errors.password ? Colors.error : Colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={Colors.textSecondary}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                clearError('password');
              }}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
          {errors.password ? (
            <Text style={styles.errorText}>{errors.password}</Text>
          ) : null}
        </View>

        {/* Botón ingresar */}
        <TouchableOpacity
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          activeOpacity={0.8}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={Colors.textPrimary} size="small" />
          ) : (
            <Text style={styles.buttonText}>Ingresar</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundPrimary,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },

  // Volver
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfacePrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },

  // Encabezado
  header: {
    alignItems: 'center',
    marginBottom: 40,
    gap: 12,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
  },

  // Formulario
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  inputWrapperError: {
    borderColor: Colors.borderError,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    height: '100%',
  },
  errorText: {
    fontSize: 13,
    color: Colors.error,
    marginLeft: 4,
  },

  // Botón
  button: {
    backgroundColor: Colors.buttonPrimary,
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },

  // Éxito
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  successIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
